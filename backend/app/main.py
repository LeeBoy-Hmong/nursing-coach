from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/")
def reading_roots():
    return "message: This is to show that I can be read from UV import."

@app.get("/health")
async def health():
    return {"status": "Healthy"}

@app.get("/docs")
def documents():
    return "How do you think I am doing."


if __name__ == "__main__":
    print(reading_roots())
    print(health())
    print(documents())