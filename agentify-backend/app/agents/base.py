"""
Base class for LLM Agents.
"""

from abc import ABC, abstractmethod
from typing import Generator

from agno.agent.agent import Agent as AgnoAgent
from agno.models.message import Message


class Agentify(ABC):
    """Interface for all LLM agents."""

    @property
    @abstractmethod
    def id(self) -> str:
        pass

    @property
    @abstractmethod
    def owner_id(self):
        pass

    @property
    @abstractmethod
    def user_id(self):
        pass

    @property
    @abstractmethod
    def session_id(self):
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @property
    @abstractmethod
    def description(self) -> str | None:
        pass

    @property
    @abstractmethod
    def system_message(self) -> str | None:
        pass

    @property
    @abstractmethod
    def status(self) -> str:
        pass

    @property
    @abstractmethod
    def model(self):
        pass

    @property
    @abstractmethod
    def history(self):
        pass

    @property
    @abstractmethod
    def agent(self) -> AgnoAgent:
        pass

    @abstractmethod
    def _get_friestore_agent_conversation_history(self) -> list[Message]:
        raise NotImplementedError

    @abstractmethod
    def _update_firestore_agent_history(self, message: Message) -> None:
        raise NotImplementedError

    @abstractmethod
    def _update_history(self, message: Message) -> None:
        raise NotImplementedError

    @abstractmethod
    def run(self, inputs: list[Message]) -> str:
        raise NotImplementedError

    @abstractmethod
    def arun(self, inputs: list[Message]) -> Generator:
        raise NotImplementedError
