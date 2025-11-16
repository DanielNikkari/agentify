"""
Handle agents service.
"""

import asyncio
import logging
import random
from datetime import datetime
from uuid import uuid4

import google.cloud.firestore as fs
from fastapi import HTTPException

from app.agents.agent import Agent as AgentInstance
from app.core.firestore import init_firestore
from app.schemas.agents import Agent, AgentCreate, Message, MessageCreate

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
    return Agent(uuid=agent_id, created_at=datetime.utcnow(), **agent_data)


async def get_messages(user_id: str, agent_id: str, session_id: str) -> list[Message]:
    """Fetch all messages for a given session."""
    try:
        db = init_firestore()

        # Query messages from Firestore using the Agno path structure
        messages_ref = (
            db.collection("users")
            .document(user_id)
            .collection("agents")
            .document(agent_id)
            .collection("sessions")
            .document(session_id)
            .collection("messages")
        )

        # Order by timestamp
        docs = messages_ref.order_by("created_at").stream()

        messages: list[Message] = []
        async for doc in docs:
            data = doc.to_dict()
            message = Message(
                id=doc.id,
                content=data.get("content", ""),
                sender="agent" if data.get("role") == "assistant" else "user",
                role=data.get("role"),
                timestamp=data.get("created_at", "").isoformat()
                if data.get("created_at")
                else "",
            )
            messages.append(message)

        return messages
    except Exception:
        logger.exception(
            f"Failed to get messages for agent {agent_id}, session {session_id}"
        )
        raise


async def send_message(
    user_id: str, agent_id: str, session_id: str, message_data: MessageCreate
) -> Message:
    """Send a message and get agent response."""
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

        # Run agent with user input (run in executor since it's synchronous)
        loop = asyncio.get_event_loop()
        response_message = await loop.run_in_executor(
            None, agent_instance.run, message_data.content, "User"
        )

        # Convert Agno Message to our Message schema
        message = Message(
            id=response_message.id or str(uuid4()),
            content=response_message.content,
            sender="agent",
            role=response_message.role,
            timestamp=datetime.utcnow().isoformat(),
        )

        return message
    except Exception:
        logger.exception(
            f"Failed to send message for agent {agent_id}, session {session_id}"
        )
        raise
