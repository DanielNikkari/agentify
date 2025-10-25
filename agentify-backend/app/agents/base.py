"""
Base class for LLM Agents.
"""

from abc import ABC, abstractmethod
from typing import Generator

from langchain.messages import AIMessage, HumanMessage


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
    def graph(self):
        pass

    @abstractmethod
    def _get_conversation_history(self) -> list[HumanMessage | AIMessage]:
        raise NotImplementedError

    @abstractmethod
    def _update_firestore_agent_history(
        self, message: HumanMessage | AIMessage
    ) -> None:
        """Update agent history to the Firestore."""
        raise NotImplementedError

    @abstractmethod
    def _update_history(self, message: HumanMessage | AIMessage) -> None:
        raise NotImplementedError

    @abstractmethod
    def run(self, inputs: list[HumanMessage | AIMessage]) -> str:
        raise NotImplementedError

    @abstractmethod
    def arun(self, inputs: list[HumanMessage | AIMessage]) -> Generator:
        raise NotImplementedError
