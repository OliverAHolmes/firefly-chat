from typing import List, Dict
import sqlite3
from contextlib import contextmanager
from app.config import settings
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatDatabase:
    def __init__(self, db_path: str = settings.DB_PATH):
        self.db_path = os.path.abspath(db_path)
        logger.info(f"DB Path (absolute): {self.db_path}")
        
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        self.init_db()

    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(self.db_path, timeout=settings.DB_TIMEOUT)
        try:
            conn.execute("PRAGMA journal_mode = WAL;")
            conn.row_factory = sqlite3.Row
            yield conn
            conn.commit()
        except sqlite3.Error as e:
            logger.error(f"Database error: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()

    def init_db(self):
        """Initialize database tables"""
        try:
            with self.get_connection() as conn:
                conn.executescript("""
                    CREATE TABLE IF NOT EXISTS chat_sessions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                    
                    CREATE TABLE IF NOT EXISTS messages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_id INTEGER NOT NULL,
                        role TEXT NOT NULL,
                        content TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
                    );
                    
                    CREATE INDEX IF NOT EXISTS idx_messages_session_id 
                    ON messages(session_id);
                """)
        except sqlite3.Error as e:
            logger.error(f"Failed to initialize database: {e}")
            raise

    def create_session(self, title: str = "New Chat") -> int:
        """Create a new chat session"""
        try:
            with self.get_connection() as conn:
                cursor = conn.execute(
                    "INSERT INTO chat_sessions (title) VALUES (?)",
                    (title,)
                )
                return cursor.lastrowid
        except sqlite3.Error as e:
            logger.error(f"Failed to create session: {e}")
            raise

    def update_session_title(self, session_id: int, title: str):
        """Update the title of a chat session"""
        try:
            with self.get_connection() as conn:
                conn.execute("""
                    UPDATE chat_sessions 
                    SET title = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                """, (title, session_id))
        except sqlite3.Error as e:
            logger.error(f"Failed to update session title: {e}")
            raise

    def save_message(self, session_id: int, role: str, content: str):
        """Save a message and update session title if needed"""
        try:
            with self.get_connection() as conn:
                # Insert the message
                conn.execute(
                    "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
                    (session_id, role, content)
                )

                # Update session title if this is the first user message
                # if role == "user":
                #     count = conn.execute(
                #         "SELECT COUNT(*) FROM messages WHERE session_id = ?",
                #         (session_id,)
                #     ).fetchone()[0]

                #     if count == 1:
                #         short_title = (content[:30] + "...") if len(content) > 30 else content
                #         self.update_session_title(session_id, short_title)
        except sqlite3.Error as e:
            logger.error(f"Failed to save message: {e}")
            raise

    def get_sessions(self) -> List[Dict]:
        """Get all chat sessions ordered by last update"""
        try:
            with self.get_connection() as conn:
                cursor = conn.execute("""
                    SELECT id, title, created_at, updated_at,
                           (SELECT COUNT(*) FROM messages WHERE session_id = chat_sessions.id) as message_count
                    FROM chat_sessions 
                    ORDER BY updated_at DESC
                """)
                return [dict(row) for row in cursor.fetchall()]
        except sqlite3.Error as e:
            logger.error(f"Failed to get sessions: {e}")
            raise

    def get_session_messages(self, session_id: int) -> List[Dict]:
        """Get all messages for a session"""
        try:
            with self.get_connection() as conn:
                cursor = conn.execute(
                    "SELECT role, content FROM messages "
                    "WHERE session_id = ? ORDER BY created_at",
                    (session_id,)
                )
                return [dict(row) for row in cursor.fetchall()]
        except sqlite3.Error as e:
            logger.error(f"Failed to get session messages: {e}")
            raise

    def delete_session(self, session_id: int):
        """Delete a chat session and its messages"""
        try:
            with self.get_connection() as conn:
                conn.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
                conn.execute("DELETE FROM chat_sessions WHERE id = ?", (session_id,))
        except sqlite3.Error as e:
            logger.error(f"Failed to delete session: {e}")
            raise
