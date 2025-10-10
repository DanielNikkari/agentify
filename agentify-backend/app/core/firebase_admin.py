"""
Initialize Firebase Admin SDK for authentication and user management.
Works for both local and Cloud Run environments.
"""

import json
import logging
import os

import dotenv
import firebase_admin
from firebase_admin import credentials

logger = logging.getLogger(__name__)

# Load .env in local development only
dotenv.load_dotenv()


def init_firebase():
    """Initialize Firebase Admin once per app runtime."""
    if firebase_admin._apps:
        return firebase_admin.get_app()

    cred = None

    # Priority 1: Cloud Run secret (JSON string)
    if os.getenv("FIREBASE_KEY_JSON"):
        try:
            firebase_key_data = json.loads(os.getenv("FIREBASE_KEY_JSON"))
            cred = credentials.Certificate(firebase_key_data)
        except Exception as e:
            raise RuntimeError(f"Failed to parse FIREBASE_KEY_JSON: {e}")

    # Priority 2: Local .env file path
    elif os.getenv("FIREBASE_CREDENTIALS_PATH"):
        path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        logger.info("PATH:", path)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Firebase credentials file not found at {path}")
        cred = credentials.Certificate(path)

    else:
        raise EnvironmentError(
            "No Firebase credentials found. "
            "Set FIREBASE_KEY_JSON (GCP) or FIREBASE_CREDENTIALS_PATH (local)."
        )

    return firebase_admin.initialize_app(cred)
