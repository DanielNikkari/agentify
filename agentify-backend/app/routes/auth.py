"""
Route for authentication through Firebase auth.
"""

from fastapi import APIRouter, Depends, Header, HTTPException
from firebase_admin import auth

from app.core.security import verify_firebase_token

router = APIRouter()


@router.post("/validate")
def validate_token(authorization: str = Header(...)):
    """Validates Firebase JWT from frontend"""
    try:
        # Expect header: Authorization: Bearer <token>
        token = authorization.split(" ")[1]
        decoded = auth.verify_id_token(token)
        return {
            "valid": True,
            "uid": decoded["uid"],
            "email": decoded.get("email"),
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")


@router.get("/me")
def get_current_user(user=Depends(verify_firebase_token)):
    """
    Return the decoded Firebase user info for the current session.
    Uses the shared verify_firebase_token() dependency.
    """
    return {
        "uid": user["uid"],
        "email": user.get("email"),
        "role": user.get("role", "demo"),
        "provider": user.get("firebase", {}).get("sign_in_provider"),
    }
