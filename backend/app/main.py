# Imports for Anthropic and FastAPI
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.services.openfda import retrieve_openfda
from app.services.rxnorm import retrieve_rxnorm_drug
from pydantic import BaseModel
from datetime import datetime, timezone
import re
import json
import anthropic
import uuid
from app.database import get_session, AsyncSession
from app.models import StudyItem, QuizQuestion, MedCard, StudyItemRead
from sqlmodel import select
from sqlalchemy.orm import selectinload

app = FastAPI()

origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8000"
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

# Create a BaseModel class -- Data Schema -- StudyItem
class NotesRequests(BaseModel):
    question: str  # Whatever is declare to this endpoint, must be a note string.
    topic: str | None = None # This is optional, users may leave it as null.

# Create a BaseModel class -- Data Schema -- MedCard
class MedCardRequests(BaseModel):
    drug_name: str
    medical_topic: str | None = None 

    
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
async def quiz_questions(userText: NotesRequests, session: AsyncSession = Depends(get_session)):
    user_question = userText.question
    user_topic = userText.topic

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

    if block.type == "text":
        reply_txt = block.text
    else:
        reply_txt = ""

    start_cleanup = re.sub(r"^```(?:\w+)?\n", "", reply_txt)  # putting it in an r'' string treats the text as raw string. so, backslashes (\) are literally backslash not separaters.
    claude_questions = re.sub(r"\n?```$", "", start_cleanup )  # completes the clean up for claude questions.
    
    # Take care of the truncation.
    if claude_questions.strip().endswith(("{","[","'")):
        raise HTTPException(status_code=502, detail={
            "error": "Bad Gateway",
            "reason": "Truncation guard triggered due to an empty or incomplete payload",
            "suggestion": "Check network connectivity"
        })
    
    print("Raw Reply", repr(claude_questions))  # This creates a raw reply in the terminal when run into a bad gateway (Error 502).
    
    try:
        claude_reply = json.loads(claude_questions)  # 1. Claude returns 10 questions (already works)

        new_study_item = StudyItem(  # 2. create a StudyItem (type="quiz", title=user_question, topic=users_topic source_type="ai_generated") -- making a folder for this quiz, no questions yet, just the label.
            type="quiz",
            title=user_question,
            topic=user_topic,
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


@app.post("/medical-card")
async def medical_card(user_text: MedCardRequests, session: AsyncSession = Depends(get_session)):
    user_drug_name = user_text.drug_name
    user_topic = user_text.medical_topic
    # Turn the dictionary into labelled sections:
    label_items = await retrieve_openfda(user_drug_name)
    ''' No label found -- openFDA has nothing for this drug, so there's nothing to
    send Claude and nothing to save. Raise here (404) instead of letting None
    flow on and crash later as a 500 -- a 500 would blame my server for a user typo.
    The raise also narrows the type: everything below is guaranteed a real dict.
    NOTE: this is NOT about nullable columns. A label with missing sections still
    gets saved -- that's what default=None on MedCard is for. Only total absence is fatal. '''
    if not label_items:
        raise HTTPException(status_code=404, detail="Your request failed to fetch the required data.")

    labeled_txt = "\n\n".join(f"{key.upper()}:\n{value}" for key, value in label_items.items() if value)

    prompt = (
        "#1. ROLE + TASK: This information is for first-year nursing students and first-year nurses."  # ---- 1. ROLE + TASK. One or two sentences.

        "2. GROUNDING RULE: Use ONLY the label text below. Do not add facts not present in it."  # 2. GROUNDING RULE. The most important line in the whole prompt.
        "If the text does not support a field, use null. Never guess.\n\n"
        
        "3. OUTPUT SHAPE: Return an object with exactly these 13 keys:\n"  # 3. OUTPUT SHAPE. Name every key. Copy them from MedCard.
        "generic_name, brand_name, drug_class, dose, route, frequency, mechanism_of_action,\n"
        "contraindications, adverse_effects, nursing_considerations, patient_teaching,\n"
        "labs_to_monitor, indication\n\n"
         
        "4. TWO EXCEPTIONS: nursing_considerations and labs_to_monitor are NOT written on FDA labels,\n"  # 4. THE TWO DERIVED FIELDS. Call them out by name.
        "because labels are written for prescribers. Derive these two from the mechanism of action,\n"
        "contraindications, and adverse effects in the label. Write them as concrete nursing actions\n"
        "(what to assess, what to hold for, what to monitor). Every other field must come from the label.\n\n"
        
        "5. LENGTH: 2-4 setences per field, plain language a first-year student understands.\n"  # 5. LENGTH. "2-4 sentences per field, plain language."
        "Expand abbreviations. Do not copy the lable's legal phrasing." 
        
        "6. FORMAT: Respond with ONLY a raw JSON object -- no markdown, no code fences,\n"  # 6. FORMAT. Same anti-markdown wording that works in /claude-quiz:
        "no text before or after. Use null, not \"unknown\" or \"\", for missing fields.\n\n"
        "Example of the exact shape:\n"
        '{"generic_name": "metoprolol tartrate", "brand_name": "Lopressor", '
        '"drug_class": "Beta-1 selective adrenergic blocker", "dose": "25-100 mg twice daily", '
        '"route": "Oral or IV", "frequency": "Twice daily", '
        '"mechanism_of_action": "Blocks beta-1 receptors in the heart, slowing heart rate and reducing the force of contraction. This lowers blood pressure and cardiac oxygen demand.", '
        '"contraindications": "Do not give in severe bradycardia, heart block beyond first degree, cardiogenic shock, or decompensated heart failure.", '
        '"adverse_effects": "Fatigue, dizziness, bradycardia, hypotension. May mask the shakiness and rapid pulse that warn of hypoglycemia in diabetic patients.", '
        '"nursing_considerations": "Check apical pulse for a full minute before each dose and hold if under 60. Check blood pressure before administration. Never stop abruptly -- rebound tachycardia and ischemia can follow.", '
        '"patient_teaching": "Rise slowly from sitting to avoid dizziness. Do not stop the medication on your own. Report a pulse under 60, swelling, or shortness of breath.", '
        '"labs_to_monitor": "Blood glucose in diabetic patients, since symptoms of low sugar may be hidden. Renal and hepatic panels for patients on long-term therapy.", '
        '"indication": "Hypertension, angina, and long-term treatment after myocardial infarction."}\n\n'

        "7. The Source -- always last\n"  # 7. THE SOURCE. Last, after all instructions.
        "LABEL TEXT:\n"  
        f"{labeled_txt}"
        )

    card_info_grab = await client.messages.create(
        model ="claude-haiku-4-5",
        max_tokens=4000,
        messages=[{
            "role": "user",
            "content": prompt
        }])
    # Create the block variable for the claude call -- ensure it's text (with method .text) if it's type (.type) is a "text", otherwise, an empty string.
    card_block = card_info_grab.content[0]
    if card_block.type == "text":
        reply_card = card_block.text
    else:
        reply_card = ""
    # Fence-strip regex (both lines)
    start_cleanup_card = re.sub(r"^```(?:\w+)?\n", "", reply_card)
    clean_card = re.sub(r"\n?```$", "", start_cleanup_card)
    # truncation guard -> HTTPException 502 -- ensure to strip (.strip()) anything that ends with dictionary closures (.endswith(~'anything that closes a dic'))
    if clean_card.strip().endswith(("{", "[", "'")):
        raise HTTPException(status_code=502, detail={
            "error": "Bad Gateway",
            "reason": "Truncation guard triggered due to an empty or incomplete payload",
            "suggestion": "Check network connectivity"
        })
    # json.loads inside a try statement -- except JSONDecodeError -> HTTPException 502
    try:
        clean_card_reply = json.loads(clean_card)

        adverse_eff = clean_card_reply.get("adverse_effects")
        brand_n = clean_card_reply.get("brand_name")
        contraindications_ = clean_card_reply.get("contraindications")
        dosage = clean_card_reply.get("dose")
        generic_n = clean_card_reply.get("generic_name")
        indication_ = clean_card_reply.get("indication")
        mech_of_action = clean_card_reply.get("mechanism_of_action")
        patient_teach = clean_card_reply.get("patient_teaching")
        route_ = clean_card_reply.get("route")
        rxcui_ = label_items.get("rxcui")
        nurse_consider = clean_card_reply.get("nursing_considerations")
        lab_monitors = clean_card_reply.get("labs_to_monitor")
        freq = clean_card_reply.get("frequency")
        drug_c = clean_card_reply.get("drug_class")
        # Create the save order
        new_study_item = StudyItem(  # 2. create a StudyItem (type="quiz", title=user_question, topic=users_topic source_type="ai_generated") -- making a folder for this quiz, no questions yet, just the label.
            type="med_card",
            title=user_drug_name,
            topic=user_topic,
            source_type="openfda"
        )

        session.add(new_study_item)  # session.add() -- Staging

        await session.flush()  # await a session.flush() -- synchronizes in-memory object changes with the database by executing the corresponding SQL statements (INSERT, UPDATE, DELETE), does not make the changes permanent.

        medical_card = MedCard(  # Need to do a .get() prior for every key (line 221-230). -- # Build MedCard using that id.
            study_item_id = new_study_item.id,
            generic_name=generic_n,
            brand_name=brand_n,
            dose=dosage,
            route=route_,
            frequency=freq,
            drug_class=drug_c,
            mechanism_of_action=mech_of_action,
            contraindications=contraindications_,
            adverse_effects=adverse_eff,
            nursing_considerations=nurse_consider,
            patient_teaching=patient_teach,
            labs_to_monitor=lab_monitors,
            indication=indication_,
            rxcui=rxcui_,
            external_verified_at=datetime.now(timezone.utc)
        )

        session.add(medical_card)

        await session.commit()  # await session.commit() -- allow both row to land, or neither.

        return {
            "id": new_study_item.id,
            "generic name":generic_n,
            "brand name":brand_n,
            "drug class": drug_c,
            "dose": dosage,
            "route": route_,
            "mechanism of action": mech_of_action,
            "contraindications": contraindications_,
            "adverse effects": adverse_eff,
            "patient teaching": patient_teach,
            "indication" : indication_,
            "rxcui": rxcui_
        }

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail="Claude returned and invalid JSON")

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

@app.get("/quizzes/{quiz_id}", response_model=StudyItemRead) # {quiz_id} is a path parameter -- Grab the quiz when a student want's that selected quiz. response_model is the JSON shape we want.
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
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, log_level="debug", reload=True)
