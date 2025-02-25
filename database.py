from typing import List, Dict
import sqlite3

class ChatDatabase:
    def __init__(self, db_path: str = "chats.db"):
        self.db_path = db_path
        self.init_db()

    def init_db(self):
        with sqlite3.connect(self.db_path, timeout=10) as conn:
            # Enable WAL mode
            conn.execute("PRAGMA journal_mode = WAL;")

            # Create tables if they don't exist
            conn.execute("""
                CREATE TABLE IF NOT EXISTS chat_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id INTEGER,
                    role TEXT,
                    content TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES chat_sessions (id)
                )
            """)

    def create_session(self, title: str = "New Chat") -> int:
        with sqlite3.connect(self.db_path, timeout=10) as conn:
            conn.execute("PRAGMA journal_mode = WAL;")
            cursor = conn.execute(
                "INSERT INTO chat_sessions (title) VALUES (?)",
                (title,)
            )
            row_id = cursor.lastrowid
            cursor.close()
            return row_id

    def update_session_title(self, session_id: int, title: str):
        with sqlite3.connect(self.db_path, timeout=10) as conn:
            conn.execute("PRAGMA journal_mode = WAL;")
            cursor = conn.execute(
                "UPDATE chat_sessions SET title = ? WHERE id = ?",
                (title, session_id)
            )
            cursor.close()

    def save_message(self, session_id: int, role: str, content: str):
        with sqlite3.connect(self.db_path, timeout=10) as conn:
            conn.execute("PRAGMA journal_mode = WAL;")
            # Insert the message
            cursor = conn.execute(
                "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
                (session_id, role, content)
            )
            cursor.close()

            # If this is the first user message, use part of it as the session title
            if role == "user":
                cursor = conn.execute(
                    "SELECT COUNT(*) FROM messages WHERE session_id = ?",
                    (session_id,)
                )
                count = cursor.fetchone()[0]
                cursor.close()

                if count == 1:
                    short_title = content[:30] + "..." if len(content) > 30 else content
                    self.update_session_title(session_id, short_title)

    def get_sessions(self) -> List[Dict]:
        with sqlite3.connect(self.db_path, timeout=10) as conn:
            conn.execute("PRAGMA journal_mode = WAL;")
            conn.row_factory = sqlite3.Row

            cursor = conn.execute(
                "SELECT * FROM chat_sessions ORDER BY created_at DESC"
            )
            rows = cursor.fetchall()
            cursor.close()

            return [dict(row) for row in rows]

    def get_session_messages(self, session_id: int) -> List[Dict]:
        with sqlite3.connect(self.db_path, timeout=10) as conn:
            conn.execute("PRAGMA journal_mode = WAL;")
            conn.row_factory = sqlite3.Row

            cursor = conn.execute(
                "SELECT role, content FROM messages "
                "WHERE session_id = ? ORDER BY created_at",
                (session_id,)
            )
            rows = cursor.fetchall()
            cursor.close()

            return [dict(row) for row in rows]

    def delete_session(self, session_id: int):
        with sqlite3.connect(self.db_path, timeout=10) as conn:
            conn.execute("PRAGMA journal_mode = WAL;")

            cursor = conn.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
            cursor.close()

            cursor = conn.execute("DELETE FROM chat_sessions WHERE id = ?", (session_id,))
            cursor.close()
