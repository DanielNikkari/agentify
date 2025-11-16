"""
Schemas for Agents.
"""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class AgentMessage(BaseModel):
    role: Literal["system", "user", "assistant", "tool"]
    content: str
    name: str | None = None
    tool_calls: list[dict[str, Any]] | None = None
    # TODO: Add image support later


class AgentCreate(BaseModel):
    name: str
    model: str
    role: str | None = None
    avatar: str | None = None
    description: str | None = None
    system_message: str | None = None
    history: list[AgentMessage] = Field(default_factory=list)
    # TODO: knowledge_base: add setting knowledge base(s)
    knowledge_base: None = None
    # TODO: tools: add setting tool(s)
    tools: None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class Agent(AgentCreate):
    uuid: str  # returned to client — server assigned
    status: Literal["active", "idle", "error"] = "idle"  # initial state is idle


class MessageCreate(BaseModel):
    content: str


class Message(BaseModel):
    id: str
    content: str
    sender: Literal["user", "agent"]
    role: str | None = None
    timestamp: str
