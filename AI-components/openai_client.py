import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def get_completion(prompt: str, model: str = "gpt-4o-mini") -> str:
    """
    Get a completion from OpenAI's API.
    
    Args:
        prompt (str): The prompt to send to the API
        model (str): The model to use (default: gpt-4o-mini)
    
    Returns:
        str: The completion text
    """
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error getting completion: {e}")
        return None

def askQuestion(question_file_path: str, context_file_path: str) -> str:
    """
    Ask a question using context from text files.
    
    Args:
        question_file_path (str): Path to the text file containing the question
        context_file_path (str): Path to the text file containing the context
    
    Returns:
        str: The completion text
    """
    try:
        # Read the question from the file
        with open(question_file_path, 'r', encoding='utf-8') as file:
            question = file.read().strip()
        
        # Read the context from the file
        with open(context_file_path, 'r', encoding='utf-8') as file:
            context = file.read().strip()
        
        prompt = f"""
        # You are a legal assistant. Based on the content of the following documents, answer the user's question as accurately and precisely as possible.

        ## Documents:
        {context}

        ## User question:
        {question}
        """
        completion = get_completion(prompt)
        return completion
    except FileNotFoundError as e:
        print(f"Error: Could not find the file: {e}")
        return None
    except Exception as e:
        print(f"Error reading file: {e}")
        return None

# Example usage
if __name__ == "__main__":
    # Test completion with text files
    question_file = "AI-components/question.txt"
    context_file = "AI-components/context.txt"
    completion = askQuestion(question_file, context_file)
    print(f"Completion: {completion}")

