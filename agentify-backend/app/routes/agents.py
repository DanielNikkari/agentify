"""
Route for handling agents.
"""

import logging

from fastapi import APIRouter, Depends

from app.core.security import verify_firebase_token
from app.schemas.agents import Agent, AgentCreate
from app.services.agents import create_agent, get_agent_by_id, get_all_agents

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
