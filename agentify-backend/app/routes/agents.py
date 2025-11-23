"""
Route for handling agents.
"""

import json
import logging

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from firebase_admin import auth

from app.core.security import verify_firebase_token
from app.schemas.agents import Agent, AgentCreate, MessageCreate, Session
from app.services.agents import (
    create_agent,
    get_agent_by_id,
    get_all_agents,
    get_session,
    send_message,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/")
async def get_agents(user=Depends(verify_firebase_token)) -> list[Agent]:
    """Return all the users agents."""
    logger.info(f"Getting all agents for user {user['uid']}")
    return await get_all_agents(user["uid"])


@router.get("/{agent_id}", response_model=Agent)
async def get_agent_route(
    agent_id: str, user: str = Depends(verify_firebase_token)
) -> Agent:
    logger.info(f"Getting agent {agent_id} for user {user['uid']}")
    return await get_agent_by_id(user["uid"], agent_id)


@router.post("/", response_model=Agent)
async def create_agent_route(
    data: AgentCreate, user: str = Depends(verify_firebase_token)
) -> Agent:
    return await create_agent(user["uid"], data)


@router.get("/{agent_id}/sessions/")
async def get_agent_session(
    agent_id: str, user: dict = Depends(verify_firebase_token)
) -> Session:
    """Get agent session."""
    logger.info(f"Getting session for agent {agent_id}, user {user['uid']}")
    return await get_session(user_id=user["uid"], agent_id=agent_id)


@router.post("/{agent_id}/sessions/{session_id}/messages")
async def send_message_route(
    agent_id: str,
    session_id: str,
    message: MessageCreate,
    user: dict = Depends(verify_firebase_token),
):
    """Send a message to an agent and stream response using Server-Sent Events."""
    logger.info(
        f"Sending message to agent {agent_id}, session {session_id}, user {user['uid']}"
    )

    async def event_generator():
        """Generate Server-Sent Events for streaming."""
        async for event in send_message(user["uid"], agent_id, session_id, message):
            # Format as SSE: data: {json}\n\n
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable buffering in nginx
        },
    )


@router.websocket("/{agent_id}/sessions/{session_id}/ws")
async def websocket_endpoint(websocket: WebSocket, agent_id: str, session_id: str):
    """WebSocket endpoint for real-time chat with an agent."""
    await websocket.accept()
    logger.info(
        f"WebSocket connection established for agent {agent_id}, session {session_id}"
    )

    user_id = None

    try:
        # Wait for authentication message
        auth_data = await websocket.receive_text()
        auth_message = json.loads(auth_data)

        if auth_message.get("type") == "auth":
            token = auth_message.get("token")
            # Verify the Firebase token and get user_id
            try:
                decoded_token = auth.verify_id_token(token)
                user_id = decoded_token["uid"]
                logger.info(f"WebSocket authenticated for user {user_id}")
            except Exception as e:
                logger.error(f"WebSocket authentication failed: {e}")
                await websocket.send_text(
                    json.dumps({"type": "error", "error": "Authentication failed"})
                )
                await websocket.close()
                return

        # Main message loop
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            if message_data.get("type") == "message":
                content = message_data.get("content")

                try:
                    # Stream message response from agent
                    async for event in send_message(
                        user_id, agent_id, session_id, MessageCreate(content=content)
                    ):
                        # Send each streaming event through WebSocket
                        await websocket.send_text(json.dumps(event))

                except Exception as e:
                    logger.error(f"Error processing message: {e}", exc_info=True)
                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "error",
                                "error": f"Failed to process message: {str(e)}",
                            }
                        )
                    )

    except WebSocketDisconnect:
        logger.info(
            f"WebSocket disconnected for agent {agent_id}, session {session_id}"
        )
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
        try:
            await websocket.send_text(json.dumps({"type": "error", "error": str(e)}))
        except Exception:
            pass
        finally:
            await websocket.close()
