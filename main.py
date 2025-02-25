import webview
import os
from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Dict

# Load environment variables from .env file
load_dotenv()

# Get API key from environment variable
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

class Api:
    """
    Exposed API for JS to call.
    We'll store a simple conversation in memory here for demonstration.
    """
    def __init__(self):
        # A list of messages in the format expected by OpenAI ChatCompletion
        # e.g. [ {"role": "user", "content": "Hi"}, {"role": "assistant", "content": "Hello!"} ]
        self.conversation_history: List[Dict[str, str]] = []

    def chat_with_openai(self, user_message: str) -> str:
        """
        Add the user's message to the conversation, call OpenAI, add the response,
        and return the assistant's reply.
        """
        if not os.getenv('OPENAI_API_KEY'):
            return "Error: OpenAI API key not found in environment variables"

        # Append the new user message
        self.conversation_history.append({"role": "user", "content": user_message})

        try:
            response = client.chat.completions.create(model="gpt-3.5-turbo",  # or gpt-4, etc.
            messages=self.conversation_history,
            max_tokens=150,
            temperature=0.7)
            assistant_reply = response.choices[0].message.content.strip()
            # Store assistant's reply
            self.conversation_history.append({"role": "assistant", "content": assistant_reply})
            return assistant_reply
        except Exception as e:
            return f"Error calling OpenAI: {str(e)}"


def get_dist_path():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dist_folder = os.path.join(current_dir, "frontend", "dist")
    index_file = os.path.join(dist_folder, "index.html")
    return index_file

if __name__ == "__main__":
    dist_index_html = get_dist_path()
    api = Api()

    window = webview.create_window(
        title="FireflyChat",
        url="http://127.0.0.1:5173",
        js_api=api
    )

    webview.start()


