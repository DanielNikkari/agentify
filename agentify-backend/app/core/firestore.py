"""
Handle Firestore operations.
"""

import json
import logging
import os
from typing import Optional

import dotenv
import google.cloud.firestore as fs
from google.oauth2 import service_account

logger = logging.getLogger(__name__)

dotenv.load_dotenv()

_db: Optional[fs.AsyncClient] = None
_db_sync: Optional[fs.Client] = None


def init_firestore() -> fs.AsyncClient:
    """Initialize Firestore db once per runtime and return the async client."""
    global _db
    if _db:
        return _db

    credentials = None
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")

    if os.getenv("FIREBASE_KEY_JSON"):
        try:
            firebase_key_data = json.loads(os.getenv("FIREBASE_KEY_JSON"))
        except json.JSONDecodeError as exc:
            raise RuntimeError(
                "Failed to parse FIREBASE_KEY_JSON for Firestore"
            ) from exc
        project_id = project_id or firebase_key_data.get("project_id")
        credentials = service_account.Credentials.from_service_account_info(
            firebase_key_data
        )
    elif os.getenv("FIREBASE_CREDENTIALS_PATH"):
        path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        if not os.path.exists(path):
            raise FileNotFoundError(f"Firebase credentials file not found at {path}")
        with open(path, "r", encoding="utf-8") as credentials_file:
            firebase_key_data = json.load(credentials_file)
        project_id = project_id or firebase_key_data.get("project_id")
        credentials = service_account.Credentials.from_service_account_info(
            firebase_key_data
        )
    else:
        raise EnvironmentError(
            "No Firestore credentials found. "
            "Set FIREBASE_KEY_JSON (GCP) or FIREBASE_CREDENTIALS_PATH (local)."
        )

    if not project_id:
        raise EnvironmentError(
            "Could not determine Firestore project. "
            "Set GOOGLE_CLOUD_PROJECT or ensure credentials include project_id."
        )

    _db = fs.AsyncClient(project=project_id, credentials=credentials)
    logger.info("Firestore async client initialized for project %s", project_id)
    return _db


def init_firestore_sync() -> fs.Client:
    """Initialize Firestore db once per runtime and return the sync client."""
    global _db_sync
    if _db_sync:
        return _db_sync

    credentials = None
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")

    if os.getenv("FIREBASE_KEY_JSON"):
        try:
            firebase_key_data = json.loads(os.getenv("FIREBASE_KEY_JSON"))
        except json.JSONDecodeError as exc:
            raise RuntimeError(
                "Failed to parse FIREBASE_KEY_JSON for Firestore"
            ) from exc
        project_id = project_id or firebase_key_data.get("project_id")
        credentials = service_account.Credentials.from_service_account_info(
            firebase_key_data
        )
    elif os.getenv("FIREBASE_CREDENTIALS_PATH"):
        path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        if not os.path.exists(path):
            raise FileNotFoundError(f"Firebase credentials file not found at {path}")
        with open(path, "r", encoding="utf-8") as credentials_file:
            firebase_key_data = json.load(credentials_file)
        project_id = project_id or firebase_key_data.get("project_id")
        credentials = service_account.Credentials.from_service_account_info(
            firebase_key_data
        )
    else:
        raise EnvironmentError(
            "No Firestore credentials found. "
            "Set FIREBASE_KEY_JSON (GCP) or FIREBASE_CREDENTIALS_PATH (local)."
        )

    if not project_id:
        raise EnvironmentError(
            "Could not determine Firestore project. "
            "Set GOOGLE_CLOUD_PROJECT or ensure credentials include project_id."
        )

    _db_sync = fs.Client(project=project_id, credentials=credentials)
    logger.info("Firestore sync client initialized for project %s", project_id)
    return _db_sync
