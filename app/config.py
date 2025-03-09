from os import path

# from dotenv import load_dotenv
import sys
import logging
import os  # Add this import

logger = logging.getLogger(__name__)

# # Load environment variables from .env file
# load_dotenv()


class Settings:
    # Application settings
    APP_NAME = "FireflyChat"
    APP_VERSION = "1.0.0"

    # Database settings
    def get_db_path(self):
        """Get the correct database path whether running from source or bundled"""
        try:
            if getattr(sys, "frozen", False):
                # Running in a bundle
                base_path = getattr(sys, "_MEIPASS", os.path.dirname(sys.executable))
                db_path = os.path.abspath(os.path.join(base_path, "data", "chats.db"))
                logger.debug(f"Using bundled DB path: {db_path}")

                # Ensure the data directory exists
                os.makedirs(os.path.dirname(db_path), exist_ok=True)

                return db_path
            else:
                # Running in normal Python environment
                db_path = os.path.abspath(
                    os.path.join(os.path.dirname(__file__), "../data/chats.db")
                )
                logger.debug(f"Using development DB path: {db_path}")

                # Ensure the data directory exists
                os.makedirs(os.path.dirname(db_path), exist_ok=True)

                return db_path
        except Exception as e:
            logger.error(f"Error determining DB path: {e}")
            raise

    DB_PATH = property(get_db_path)
    DB_TIMEOUT = 10

    # OpenAI settings
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = "gpt-4o"
    MAX_TOKENS = 1200
    TEMPERATURE = 0.7


settings = Settings()
