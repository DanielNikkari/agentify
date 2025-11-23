"""
Handle agents service.
"""

import asyncio
import json
import logging
import random
from datetime import datetime
from uuid import uuid4

import google.cloud.firestore as fs
from fastapi import HTTPException

from app.agents.agent import Agent as AgentInstance
from app.core.firestore import init_firestore
from app.schemas.agents import Agent, AgentCreate, Message, MessageCreate, Session

logger = logging.getLogger(__name__)


async def get_all_agents(user_id: str) -> list[Agent]:
    """Fetch all agents for the authenticated user."""
    try:
        db = init_firestore()

        agents_ref = db.collection("users").document(user_id).collection("agents")

        docs = agents_ref.stream()  # async generator

        agents: list[Agent] = []
        async for doc in docs:
            data = doc.to_dict()
            if "uuid" not in data:
                data["uuid"] = doc.id
            agents.append(Agent(**data))

        return agents
    except Exception:
        logger.exception(f"Failed to get all agents for the user {user_id}")
        raise


async def get_agent_by_id(user_id: str, agent_id: str) -> Agent:
    """Fetch exactly one agent for authenticated user."""
    try:
        db = init_firestore()

        doc = (
            await db.collection("users")
            .document(user_id)
            .collection("agents")
            .document(agent_id)
            .get()
        )

        if not doc.exists:
            raise HTTPException(status_code=404, detail="Agent not found")

        data = doc.to_dict()
        return Agent(uuid=agent_id, **data)
    except Exception:
        logger.exception(f"Failed to get agent {agent_id} for the user {user_id}")
        raise


async def create_agent(user_id: str, data: AgentCreate) -> Agent:
    """Create one agent for the user."""
    db = init_firestore()

    agent_id = uuid4().hex  # always backend-generated
    agent_data = data.model_dump()

    # If avatar url not set, set randomly one of the default avatars
    if not agent_data.get("avatar"):
        rand_num = random.randint(0, 19)
        agent_data["avatar"] = str(rand_num)

    agent_data["created_at"] = fs.SERVER_TIMESTAMP
    history = agent_data.pop(
        "history", []
    )  # Pop history as it will be inserted into its own collection

    agent_ref = (
        db.collection("users").document(user_id).collection("agents").document(agent_id)
    )

    await agent_ref.set(agent_data, merge=False)

    for item in history:
        await agent_ref.collection("history").add(
            {
                "role": item["role"],
                "content": item["content"],
                "name": item.get("name", None),
                "tool_calls": item.get("tool_calls", None),
                "timestamp": fs.SERVER_TIMESTAMP,
            }
        )

    agent_data.pop("created_at")
    agent_data["history"] = history
    return Agent(uuid=agent_id, created_at=datetime.now(), **agent_data)


async def get_session(user_id: str, agent_id: str) -> tuple[str, list[Message]]:
    """
    Fetch agent session.

    Args:
        user_id (str)
        agent_id (str)
    Returns:
        tuple(str, list[Message]): Returns a tuple with session_id and list of messages from history
    """
    try:
        db = init_firestore()

        sessions = (
            await db.collection("users")
            .document(user_id)
            .collection("agents")
            .document(agent_id)
            .collection("sessions")
            .get()
        )

        # Create new session if there is no sessions yet
        if not sessions:
            return Session(session_id=uuid4().hex)

        session = sessions[0]
        session_dict = session.to_dict()
        session_id = session_dict.get("session_id") or session.id

        # Parse runs - might be JSON string or array
        runs_data = session_dict.get("runs", [])
        if isinstance(runs_data, str):
            try:
                runs = json.loads(runs_data)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse runs JSON for session {session_id}")
                runs = []
        else:
            runs = runs_data

        messages = []
        seen_message_ids = set()  # Track message IDs to avoid duplicates

        for run in runs:
            # Skip if run is not a dict
            if not isinstance(run, dict):
                logger.warning(f"Unexpected run type: {type(run)}, skipping")
                continue

            for message in run.get("messages", []):
                if message.get("role") == "system":
                    continue

                message_id = message.get("id")

                # Skip if we've already processed this message
                if message_id and message_id in seen_message_ids:
                    logger.debug(f"Skipping duplicate message: {message_id}")
                    continue

                if message_id:
                    seen_message_ids.add(message_id)

                # Convert Unix timestamp to ISO format
                created_at = message.get("created_at")
                timestamp = (
                    datetime.fromtimestamp(created_at).isoformat() if created_at else ""
                )

                msg = Message(
                    id=message_id or f"msg-{len(messages)}",
                    content=message.get("content", ""),
                    sender="agent" if message.get("role") == "assistant" else "user",
                    role=message.get("role"),
                    timestamp=timestamp,
                    tokens=message.get("metrics", {}).get("total_tokens", 0),
                )
                messages.append(msg)

        logger.info(f"Loaded {len(messages)} messages for session {session_id}")
        return Session(session_id=session_id, messages=messages)
    except Exception:
        logger.exception(f"Failed to fetch the session for agent {agent_id}")
        raise


async def send_message(
    user_id: str, agent_id: str, session_id: str, message_data: MessageCreate
):
    """Send a message and stream agent response as it arrives.

    Yields:
        dict: Event objects with type and data, e.g.:
            - {"type": "content", "data": "chunk of text"}
            - {"type": "completed", "data": {"content": "full text", "metrics": {...}}}
    """
    try:
        # Get agent configuration
        agent_config = await get_agent_by_id(user_id, agent_id)

        # Create agent instance with session_id
        agent_instance = AgentInstance(
            id=agent_id,
            owner_id=user_id,
            user_id=user_id,
            session_id=session_id,
            name=agent_config.name,
            model=agent_config.model,
            status=agent_config.status,
            role=agent_config.role,
            description=agent_config.description,
            system_message=agent_config.system_message,
        )

        # Stream agent response
        # Note: agent_instance.stream() is a synchronous generator,
        # so we need to run each iteration in an executor
        loop = asyncio.get_event_loop()
        stream_generator = agent_instance.stream(message_data.content, "User")

        # Iterate over the synchronous generator in an async-compatible way
        while True:
            try:
                # Get next event from the synchronous generator in an executor
                event = await loop.run_in_executor(None, next, stream_generator, None)
                if event is None:
                    break
            except StopIteration:
                break
            event_type = event.event

            if event_type == "RunStarted":
                yield {
                    "type": "started",
                    "data": {
                        "run_id": event.run_id,
                        "agent_name": event.agent_name,
                    },
                }

            elif event_type == "RunContent":
                # Yield content chunks as they arrive
                if event.content:
                    yield {"type": "content", "data": event.content}

            elif event_type == "RunContentCompleted":
                yield {"type": "content_completed", "data": {}}

            elif event_type == "RunCompleted":
                # Final event with complete content and metrics
                yield {
                    "type": "completed",
                    "data": {
                        "content": event.content,
                        "metrics": {
                            "input_tokens": event.metrics.input_tokens,
                            "output_tokens": event.metrics.output_tokens,
                            "total_tokens": event.metrics.total_tokens,
                        }
                        if event.metrics
                        else None,
                    },
                }

    except Exception:
        logger.exception(
            f"Failed to send message for agent {agent_id}, session {session_id}"
        )
        raise
