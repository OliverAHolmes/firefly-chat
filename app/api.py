import logging
from typing import List, Dict
from openai import OpenAI
from app.database import ChatDatabase
from app.config import settings

logger = logging.getLogger(__name__)

# Initialize OpenAI client with API key from settings
client = OpenAI(api_key=settings.OPENAI_API_KEY)

class Api:
    """API exposed to the frontend via PyWebView."""
    
    def __init__(self):
        self.db = ChatDatabase()
        self.current_session_id = None
        logger.info("API initialized with database connection")

    def create_new_session(self) -> Dict:
        """Create a new chat session"""
        session_id = self.db.create_session()
        self.current_session_id = session_id
        logger.info(f"Created new session with ID: {session_id}")
        return {"session_id": session_id}

    def get_sessions(self) -> List[Dict]:
        """Get all chat sessions"""
        return self.db.get_sessions()

    def load_session(self, session_id: int) -> List[Dict]:
        """Load messages from a specific session"""
        self.current_session_id = session_id
        logger.info(f"Loading session: {session_id}")
        return self.db.get_session_messages(session_id)

    def delete_session(self, session_id: int) -> Dict:
        """Delete a chat session"""
        self.db.delete_session(session_id)
        if self.current_session_id == session_id:
            self.current_session_id = None
        logger.info(f"Deleted session: {session_id}")
        return {"success": True}

    def chat_with_openai(self, user_message: str) -> str:
        """Send message to OpenAI and save the conversation"""
        # if not settings.OPENAI_API_KEY:
        #     logger.error("OpenAI API key not found in environment variables")
        #     return "Error: OpenAI API key not found in environment variables"

        if not self.current_session_id:
            self.current_session_id = self.db.create_session()
            logger.info(f"Created new session: {self.current_session_id}")

        try:
            # Save user message
            self.db.save_message(self.current_session_id, "user", user_message)
            
            # Get session history
            messages = self.db.get_session_messages(self.current_session_id)
            
            # Call OpenAI
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                max_tokens=settings.MAX_TOKENS,
                temperature=settings.TEMPERATURE
            )
            
            assistant_reply = response.choices[0].message.content.strip()
            
            # Save assistant reply
            self.db.save_message(self.current_session_id, "assistant", assistant_reply)
            
            return assistant_reply

        except Exception as e:
            error_msg = f"Error calling OpenAI: {str(e)}"
            logger.error(error_msg)
            return error_msg 

    def rename_session(self, session_id: int, new_title: str) -> Dict:
        """Rename a chat session"""
        try:
            self.db.update_session_title(session_id, new_title)
            logger.info(f"Renamed session {session_id} to: {new_title}")
            return {"success": True, "title": new_title}
        except Exception as e:
            logger.error(f"Failed to rename session: {e}")
            return {"success": False, "error": str(e)} 