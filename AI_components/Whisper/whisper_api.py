import whisper
from fastapi import FastAPI, UploadFile, File, HTTPException
import tempfile
import uvicorn
import os
from AI_components import rag_search
from fastapi import Request
from pydantic import BaseModel
from AI_components import simple_rag

app = FastAPI()
model = whisper.load_model("base")

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    try:
        suffix = os.path.splitext(file.filename)[1] or ".mp3"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name

        result = model.transcribe(tmp_path)
        return {"transcript": result["text"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class RAGRequest(BaseModel):
    question: str
    top_k: int = 3

@app.post("/rag-search")
async def rag_search_endpoint(request: RAGRequest):
    try:
        results = rag_search.rag_search(request.question, top_k=request.top_k)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SimpleRAGRequest(BaseModel):
    question: str
    model: str = "gpt-4.1-mini"
    max_tokens: int = 512

@app.post("/simple-rag")
async def simple_rag_endpoint(request: SimpleRAGRequest):
    try:
        answer = simple_rag.simple_rag(request.question, model=request.model, max_tokens=request.max_tokens)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

      #python -m venv venv
      #source venv/bin/activate
      #python -m uvicorn whisper_api:app --host 0.0.0.0 --port 8000