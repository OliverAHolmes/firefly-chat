import webview
import os
from app.api import Api
from app.config import settings
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_dist_path() -> str:
    """Get the path to the frontend dist directory"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dist_folder = os.path.join(current_dir, "frontend", "dist")
    index_file = os.path.join(dist_folder, "index.html")
    return index_file

if __name__ == "__main__":
    try:
        dist_index_html = get_dist_path()
        api = Api()

        # Create and configure the window
        window = webview.create_window(
            title=settings.APP_NAME,
            url="http://127.0.0.1:5173",
            js_api=api
        )

        logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
        webview.start()

    except Exception as e:
        logger.error(f"Application failed to start: {e}")
        raise


