# Imports for Anthropic and FastAPI
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from pydantic import BaseModel
import re
import json
import anthropic
import uuid
from app.database import get_session, AsyncSession
from app.models import StudyItem, QuizQuestion
from sqlmodel import select
from sqlalchemy.orm import selectinload

app = FastAPI()

origins = [
    "http://localhost:8081"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Create a client instance storing it in a variable - utilize api key.
client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api)

# Create a BaseModle class -- Data Schema --
class NotesRequests(BaseModel):
    notes: str  # Whatever is declare to this endpoint, must be a note string.
""" 
# @app.post("/claude-reply")
# async def user_question(question: NotesRequests):  # run the model as the argument not the 
#     # Capture the structure the incoming text. Create a variable to represent it.
#     user_notes = question.notes
#     # Use the json import to dump or process structured logs.
#     logging_payload = json.dumps({"received notes": user_notes})
#     print(f"Logging JSON payload: {logging_payload}")
#     # Run the Claude model similar to 'claude-reply' and then utilize the POST data as the argument.
#     message = await client.messages.create(
#         model="claude-haiku-4-5",
#         max_tokens=1024,
#         messages=[{
#             "role": "user",
#             "content": f"Analyze the given notes: {user_notes}"
#         }]
#     )

#     # Block extract the reponse simillr to 'claude-reply'.
#     block = message.content[0]
#     reply_text = block.text if block.type == "text" else ""
#     # Return the input.
#     return {
#         "Notes": user_notes,
#         "Reply": reply_text
#     } """

@app.post("/claude-quiz")  # Create quizzes with the given keyword by claude.
async def quiz_questions(questions: NotesRequests, session: AsyncSession = Depends(get_session)):
    user_question = questions.notes

    quizzer = await client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": (
    "Create 10 quiz questions from the topic below. "
    "Respond with ONLY a raw JSON array — no markdown, no code fences, "
    "no text before or after. "
    'Example: [{"question": "What is X?", "answer": "Y"}]\n\n'
    f"Topic: {user_question}"
)
        }]
    )
    block = quizzer.content[0]
    reply_txt = block.text if block.type == "text" else ""
    start_cleanup = re.sub(r"^```(?:\w+)?\n", "", reply_txt)  # putting it in an r'' string treats the text as raw string. so, backslashes (\) are literally backslash not separaters.
    claude_questions = re.sub(r"\n?```$", "", start_cleanup )  # completes the clean up for claude questions.
    
    # Take care of the trunacation.
    if claude_questions.strip().endswith(("{","[","'")):
        raise HTTPException(status_code=502, detail="Truncated response detected. It should be cut off.")
    
    print("Raw Reply", repr(claude_questions))  # This creates a raw reply in the terminal when run into a bad gateway (Error 502).
    
    try:
        claude_reply = json.loads(claude_questions)  # 1. Claude returns 10 questions (already works)

        new_study_item = StudyItem(  # 2. create a StudyItem (type="quiz", title=topic, source_type="ai_generated") -- making a folder for this quiz, no questions yet, just the label.
            type="quiz",
            title=user_question,
            source_type="ai_generated"
        )

        session.add(new_study_item)  # 3. session.add(study_item) -- staging the folder in the outbox, not save in db yet.

        await session.flush()  # 4. await session.flush() ← gives study_item.id WITHOUT committing yet -- still making an async call, so where giving it it's ID number.
        # 5. loop the questions → QuizQuestion(study_item_id=..., position=i+1)
        quiz_questions_add =  []
        for i, question in enumerate(claude_reply):
            questions_formed = QuizQuestion(
                study_item_id=new_study_item.id,
                question=question["question"],
                answer=question["answer"],
                position= i + 1,
            )
            quiz_questions_add.append(questions_formed)  # Collecting the batch after the loop with out list.

        session.add_all(quiz_questions_add)  # 6. session.add_all(...) -- drop all 10 questions in the outbox together.

        await session.commit()  #7. await session.commit() ← all 11 rows land together, or none do -- await is needed because this is an async call. Mail the outbox.
        #8. return the saved data + the new "id"
        return {
            "id": new_study_item.id,
            "users question": user_question,
            "claude's reply": claude_reply
    }

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail="Claude returned and invalid JSON")  # This creates a guard to ensure json.loads fail properly instead of 500 status crash.

@app.get("/quizzes")  # List out the currently saved quizzes from supabase
async def database_quizzes(session: AsyncSession = Depends(get_session)):
    ''' 1a. Build out a query -- created a statement variable with select function from SQLAlchemy a .where() & .order_by() method.
    1b. We're pulling from the study_item table -- remember we changed the class StudyItem '''
    statement = select(StudyItem).where(StudyItem.type == "quiz").order_by(StudyItem.created_at.desc())  # type: ignore
    # 2a. Run the query that was built -- give the results and object
    results = await session.execute(statement)
    '''# .scalars() unwraps the row tuple. execute() always returns rows as tuples
    # because SQL can select several things at once -- select(StudyItem) gives
    # (StudyItem,), select(StudyItem, QuizQuestion) gives (StudyItem, QuizQuestion).
    # scalars() takes the FIRST column of each row, so here: StudyItem objects.
    # .all() then collects them into a list.
    # (SQLModel's session.exec() does this unwrapping for you -- we use SQLAlchemy's
    #  execute(), so we unwrap manually.)'''
    quiz_results = results.scalars().all()

    return quiz_results

@app.get("/quizzes/{quiz_id}") # {quiz_id} is a path parameter -- Grab the quiz when a student want's that selected quiz.
async def get_id(quiz_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    # 3. Fetch the children of what we are looking for.
    statement = select(StudyItem).where(StudyItem.id == quiz_id).options(selectinload(StudyItem.questions))  # selectinload -- eager loads it. # type: ignore

    results = await session.execute(statement)

    quiz_results = results.scalar_one_or_none()
    # 2. Write an if statement to return an error if that id does not exist.
    if not quiz_results:
        raise HTTPException(status_code=404, detail="Your request failed to fetch the required data.") # Server reached the site, but the request failed.

    return quiz_results
    

@app.get("/")
def reading_roots():
    return "message: This is to show that I can be read from UV import."

@app.get("/health")
async def health():
    return {"status": "Healthy"}

'''@app.get("/test")
def test():
    return {"key_loaded": bool(settings.anthropic_api)}
'''

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)