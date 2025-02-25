import webview
import os
from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Dict
from database import ChatDatabase

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
        self.db = ChatDatabase()
        self.current_session_id = None

    def create_new_session(self) -> Dict:
        """Create a new chat session"""
        session_id = self.db.create_session()
        self.current_session_id = session_id
        return {"session_id": session_id}

    def get_sessions(self) -> List[Dict]:
        """Get all chat sessions"""
        return self.db.get_sessions()

    def load_session(self, session_id: int) -> List[Dict]:
        """Load messages from a specific session"""
        self.current_session_id = session_id
        return self.db.get_session_messages(session_id)

    def delete_session(self, session_id: int) -> Dict:
        """Delete a chat session"""
        self.db.delete_session(session_id)
        if self.current_session_id == session_id:
            self.current_session_id = None
        return {"success": True}

    def chat_with_openai(self, user_message: str) -> str:
        """Send message to OpenAI and save the conversation"""
        if not self.current_session_id:
            self.current_session_id = self.db.create_session()

        if not os.getenv('OPENAI_API_KEY'):
            return "Error: OpenAI API key not found in environment variables"

        # Save user message
        self.db.save_message(self.current_session_id, "user", user_message)

        try:
            # Get session history
            messages = self.db.get_session_messages(self.current_session_id)
            
            # Call OpenAI
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=150,
                temperature=0.7
            )
            
            assistant_reply = response.choices[0].message.content.strip()
            
            # Save assistant reply
            self.db.save_message(self.current_session_id, "assistant", assistant_reply)
            
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


