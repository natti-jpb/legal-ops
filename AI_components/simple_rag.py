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


def read_files_recursively(directory: Path, exts=(".txt", ".pdf", ".docx")) -> List[str]:
    """
    Reads all .txt, .pdf, and .docx files and returns a list of their contents as strings.
    """
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


def simple_rag(question: str, model: str = "gpt-4.1-mini", max_tokens: int = 512) -> str:
    """
    Reads all case files (.txt, .pdf, .docx), concatenates their content, combines with the question, and sends to OpenAI for a direct answer.
    """
    case_contents = read_files_recursively(CASES_DIR)
    context = "\n\n".join(case_contents)
    prompt = f"Context extracted from case files:\n{context}\n\nQuestion: {question}\nAnswer:"
    print(context)
    print(question)
    response = openai_client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=0.2
    )
    return response.choices[0].message.content.strip() 