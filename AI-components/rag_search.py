import os
from dotenv import load_dotenv
from openai import OpenAI
import tiktoken
from pathlib import Path
from typing import List, Tuple
import numpy as np

# Load environment variables from .env file
load_dotenv()

# Settings
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not set in environment or .env file")

openai_client = OpenAI(api_key=OPENAI_API_KEY)

CASES_DIR = Path(__file__).parent.parent / 'pages' / 'api' / 'cases'
CHUNK_SIZE = 500  # tokens
CHUNK_OVERLAP = 50  # tokens
EMBEDDING_MODEL = 'text-embedding-ada-002'


def read_files_recursively(directory: Path, exts=(".ts", ".js", ".json")) -> List[Tuple[str, str]]:
    """Reads all files with specified extensions and returns a list of (path, content)."""
    files = []
    for path in directory.rglob("*"):
        if path.is_file() and path.suffix in exts:
            with open(path, encoding="utf-8") as f:
                files.append((str(path), f.read()))
    return files


def chunk_text(text: str, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP) -> List[str]:
    """Splits the text into chunks of chunk_size with overlap."""
    enc = tiktoken.get_encoding("cl100k_base")
    tokens = enc.encode(text)
    chunks = []
    for i in range(0, len(tokens), chunk_size - overlap):
        chunk = tokens[i:i+chunk_size]
        chunks.append(enc.decode(chunk))
    return chunks


def get_embedding(text: str) -> List[float]:
    """Generates embedding using OpenAI (>=1.0.0)."""
    response = openai_client.embeddings.create(
        input=[text],
        model=EMBEDDING_MODEL
    )
    return response.data[0].embedding


def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def main():
    print(f"Reading files from {CASES_DIR}...")
    files = read_files_recursively(CASES_DIR)
    print(f"{len(files)} files found.")

    # Chunking and indexing
    all_chunks = []  # (file, chunk, embedding)
    for file_path, content in files:
        chunks = chunk_text(content)
        for idx, chunk in enumerate(chunks):
            emb = get_embedding(chunk)
            all_chunks.append((file_path, idx, chunk, emb))
    print(f"{len(all_chunks)} chunks indexed.")

    # User question
    question = input("Enter your question: ")
    q_emb = get_embedding(question)

    # Similarity
    scored = []
    for file_path, idx, chunk, emb in all_chunks:
        sim = cosine_similarity(q_emb, emb)
        scored.append((sim, file_path, idx, chunk))
    scored.sort(reverse=True)

    print("\nTop 3 most relevant chunks:")
    for sim, file_path, idx, chunk in scored[:3]:
        print(f"\nFile: {file_path} [chunk {idx}]\nScore: {sim:.3f}\nExcerpt:\n{chunk[:500]}\n---")


if __name__ == "__main__":
    main()
