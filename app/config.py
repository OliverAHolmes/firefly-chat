import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # Application settings
    APP_NAME = "FireflyChat"
    APP_VERSION = "1.0.0"
    
    # Database settings
    DB_PATH = Path("data/chats.db")
    DB_TIMEOUT = 10
    
    # OpenAI settings
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = "gpt-4o"
    MAX_TOKENS = 150
    TEMPERATURE = 0.7

    def __init__(self):
        # Ensure data directory exists
        self.DB_PATH.parent.mkdir(parents=True, exist_ok=True)

settings = Settings() 