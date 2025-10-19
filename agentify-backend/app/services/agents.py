"""
Handle agents service.
"""

import logging
from uuid import uuid4

from fastapi import HTTPException

from app.core.firestore import init_firestore
from app.schemas.agents import Agent, AgentCreate

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

    await (
        db.collection("users")
        .document(user_id)
        .collection("agents")
        .document(agent_id)
        .set(agent_data)
    )

    return Agent(uuid=agent_id, **agent_data)
