"""
Schemas for Agents.
"""

from typing import Literal

from pydantic import BaseModel


class AgentCreate(BaseModel):
    name: str
    model: str
    role: str | None = None
    avatar: str | None = None
    description: str | None = None
    # TODO: knowledge_base: add setting knowledge base(s)
    knowledge_base: None = None
    # TODO: tools: add setting tool(s)
    tools: None = None


class Agent(AgentCreate):
    uuid: str  # returned to client — server assigned
    status: Literal["active", "idle", "error"] = "idle"  # initial state is idle
