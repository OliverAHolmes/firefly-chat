import webview
import os
import logging
from app.api import Api
from app.config import settings

# Set up logging to both file and console
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        # File handler
        logging.FileHandler(
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "app.log")
        ),
        # Console handler
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


def get_dist_path() -> str:
    """Get the path to the frontend dist directory"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dist_folder = os.path.join(current_dir, "frontend", "dist")
    index_file = os.path.join(dist_folder, "index.html")
    logger.debug(f"Current dir: {current_dir}")
    logger.debug(f"Dist folder: {dist_folder}")
    logger.debug(f"Index file: {index_file}")
    return index_file


if __name__ == "__main__":
    try:
        logger.info("Starting application...")
        dist_index_html = get_dist_path()
        logger.debug(f"Frontend path: {dist_index_html}")

        api = Api()
        logger.info("API initialized")

        # Create and configure the window
        window = webview.create_window(
            title=settings.APP_NAME,
            url=dist_index_html,
            # url="http://127.0.0.1:5173",
            js_api=api,
        )

        logger.info(f"Starting {settings.APP_NAME}")
        webview.start(
            icon=os.path.join(os.path.dirname(os.path.abspath(__file__)), "logo.icns")
        )

    except Exception as e:
        logger.error(f"Application failed to start: {e}")
        raise
