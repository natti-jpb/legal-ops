import whisper
from fastapi import FastAPI, UploadFile, File, HTTPException
import tempfile
import uvicorn
import os

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

      # python -m venv venv
      #source venv/bin/activate
      #python -m uvicorn whisper_api:app --host 0.0.0.0 --port 8000