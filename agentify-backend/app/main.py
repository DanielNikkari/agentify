"""
Entrypoint for the agentify app.
"""

import logging

from fastapi import Depends, FastAPI

from app.core.firebase_admin import init_firebase
from app.core.security import verify_firebase_token
from app.routes import auth

logger = logging.getLogger(__name__)
logging.basicConfig(
    encoding="utf-8",
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s:%(lineno)d - %(message)s",
)


def create_app() -> FastAPI:
    app = FastAPI(
        title="agentify backend",
        version="1.0.0",
        description="Serverless agentic platform backend.",
    )

    # Initialize Firebase
    try:
        init_firebase()
        logger.info("Firebase initialized succesfully!")
    except Exception:
        logger.exception("Firebase initialization failed")
        raise

    # Register routers
    app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

    return app


app: FastAPI = create_app()


@app.get("/")
def root():
    return {"message": "Hello from agentify-backend!"}


@app.get("/protected")
def protected(user=Depends(verify_firebase_token)):
    return {"message": "Hello, your token is verified!"}
