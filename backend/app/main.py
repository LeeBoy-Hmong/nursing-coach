# Imports for Anthropic and FastAPI
from fastapi import FastAPI, HTTPException
from config import settings
from pydantic import BaseModel
import re
import json
import anthropic

app = FastAPI()

# Create a client instance storing it in a variable - utilize api key.
client = anthropic.Anthropic(api_key=settings.anthropic_api)

# Create a BaseModle class -- Data Schema --
class NotesRequests(BaseModel):
    notes: str  # Whatever is declare to this endpoint, must be a note string.

@app.post("/claud-reply")
async def user_question(question: NotesRequests):  # run the model as the argument not the 
    # Capture the structure the incoming text. Create a variable to represent it.
    user_notes = question.notes
    # Use the json import to dump or process structured logs.
    logging_payload = json.dumps({"received notes": user_notes})
    print(f"Logging JSON payload: {logging_payload}")
    # Run the Claude model similar to 'claude-reply' and then utilize the POST data as the argument.
    message = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"Analyze the given notes: {user_notes}"
        }]
    )
    # Block extract the reponse simillr to 'claude-reply'.
    block = message.content[0]
    reply_text = block.text if block.type == "text" else ""
    # Return the input.
    return {
        "Notes": user_notes,
        "Reply": reply_text
    }

@app.post("/claude-quiz")
async def quiz_questions(questions: NotesRequests):
    user_question = questions.notes

    quizzer = client.messages.create(
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
    start_cleanup = re.sub(r"^````(?:\w+)?\n", "", reply_txt)  # putting it in an r'' string treats the text as raw string. so, backslashes (\) are literally backslash not separaters.
    complete_reply = re.sub(r"\n?```$", "", start_cleanup )  # completes the clean up.
    
    # Take care of the trunacation.
    if complete_reply.strip().endswith(("{","[","'")):
        raise ValueError("Truncated response was detected. Response was cut.")
    
    print("Raw Reply", repr(complete_reply))  # This creates a raw reply in the terminal when run into a bad gateway (Error 502).
    
    try:
        claude_reply = json.loads(complete_reply)
        return {
        "users question": user_question,
        "claude's reply": f"Here are 10 quizzes to your question: {claude_reply}"
    }
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail="Claude returned and invalid JSON")  # This creates a guard to ensure json.loads fail properly instead of 500 status crash.

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
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)