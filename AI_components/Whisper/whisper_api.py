import os
import sys
import tempfile
from pathlib import Path
from typing import List
import logging

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import whisper
import PyPDF2
import docx
from dotenv import load_dotenv
from openai import OpenAI

# --- Setup ---
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
load_dotenv()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not set in environment or .env file")

openai_client = OpenAI(api_key=OPENAI_API_KEY)

logger = logging.getLogger('uvicorn.error')
logger.setLevel(logging.DEBUG)

# --- FastAPI setup ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = whisper.load_model("base")

# --- File reading utility ---
def read_files_recursively(directory):
    directory = Path(directory)
    exts = (".txt", ".pdf", ".docx")
    contents = []
    for path in directory.rglob("*"):
        if path.is_file() and path.suffix.lower() in exts:
            try:
                if path.suffix.lower() == ".txt":
                    with open(path, encoding="utf-8") as f:
                        contents.append(f.read())
                elif path.suffix.lower() == ".pdf":
                    with open(path, "rb") as f:
                        reader = PyPDF2.PdfReader(f)
                        text = "\n".join(page.extract_text() or "" for page in reader.pages)
                        contents.append(text)
                elif path.suffix.lower() == ".docx":
                    doc = docx.Document(path)
                    text = "\n".join([para.text for para in doc.paragraphs])
                    contents.append(text)
            except Exception as e:
                contents.append(f"[Error reading {path.name}: {e}]")
    return contents

# --- Simple RAG logic ---
def simple_rag(question, case_id, model="gpt-4.1-mini", max_tokens=512):
    case_dir = os.path.join("/Users/misha/Desktop/Freie/Mobile communications/Final project/legal-ops/public/data/case-files", case_id, "documents")
    case_contents = read_files_recursively(case_dir)
    context = "\n\n".join(case_contents)
    logger.debug(context)
    prompt = (
        "You are a legal assistant specialized in analyzing documents related to law cases. "
        "Your job is to help lawyers and legal professionals by answering questions based on the provided case documents. "
        "Always provide clear, concise, and accurate answers using only the information available in the documents. "
        "If the answer is not present in the documents, say you do not have enough information.\n"
        f"\nContext:\n{context}\n"
        f"\nQuestion: {question}\nAnswer:"
    )

    response = openai_client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=0.2
    )
    return response.choices[0].message.content.strip()

# --- Routes ---

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    try:
        suffix = os.path.splitext(file.filename)[1] or ".mp3"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        result = model.transcribe(tmp_path)
        return {"transcript": result["text"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")


class SimpleRAGRequest(BaseModel):
    question: str
    case_id: str
    model: str = "gpt-4.1-mini"
    max_tokens: int = 512

@app.post("/simple-rag")
async def simple_rag_endpoint(request: SimpleRAGRequest):
    logger.debug(request)
    try:
        answer = simple_rag(
            request.question,
            case_id=request.case_id,
            model=request.model,
            max_tokens=request.max_tokens
        )
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simple RAG error: {str(e)}")

# --- Run Command ---
# python -m uvicorn whisper_api:app --host 0.0.0.0 --port 8000
