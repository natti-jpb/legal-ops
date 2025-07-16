import os
from dotenv import load_dotenv
from openai import OpenAI
from pathlib import Path
from typing import List
import PyPDF2
import docx

# Load environment variables from .env file
load_dotenv()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not set in environment or .env file")

openai_client = OpenAI(api_key=OPENAI_API_KEY)

CASES_DIR = Path(__file__).parent.parent / 'app' / 'cases'


def read_files_recursively(directory):
    from pathlib import Path
    directory = Path(directory)
    exts = (".txt", ".pdf", ".docx")  # Allowed extensions
    contents = []
    for path in directory.rglob("*"):
        if path.is_file() and path.suffix.lower() in exts:
            if path.suffix.lower() == ".txt":
                with open(path, encoding="utf-8") as f:
                    contents.append(f.read())
            elif path.suffix.lower() == ".pdf":
                try:
                    with open(path, "rb") as f:
                        reader = PyPDF2.PdfReader(f)
                        text = "\n".join(page.extract_text() or "" for page in reader.pages)
                        contents.append(text)
                except Exception as e:
                    contents.append(f"[Error reading PDF {path}: {e}]")
            elif path.suffix.lower() == ".docx":
                try:
                    doc = docx.Document(path)
                    text = "\n".join([para.text for para in doc.paragraphs])
                    contents.append(text)
                except Exception as e:
                    contents.append(f"[Error reading DOCX {path}: {e}]")
    return contents


def simple_rag(question, case_id, model="gpt-4.1-mini", max_tokens=512):
    CASES_DIR = "public/data/case-files"
    case_dir = os.path.join(CASES_DIR, case_id, "documents")
    case_contents = read_files_recursively(case_dir)
    context = "\n\n".join(case_contents)
    prompt = (
        "You are a legal assistant specialized in analyzing documents related to law cases. "
        "Your job is to help lawyers and legal professionals by answering questions based on the provided case documents. "
        "Always provide clear, concise, and accurate answers using only the information available in the documents. "
        "If the answer is not present in the documents, say you do not have enough information.\n"
        f"\nContext:\n{context}\n"
        f"\nQuestion: {question}\nAnswer:"
    )
    print(context)
    print(question)
    response = openai_client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=0.2
    )
    return response.choices[0].message.content.strip() 