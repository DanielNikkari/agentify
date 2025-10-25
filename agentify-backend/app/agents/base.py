"""
Base class for LLM Agents.
"""

from abc import ABC, abstractmethod
from typing import Generator

from langchain.messages import AIMessage, HumanMessage

from app.core.firestore import init_firestore_sync


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
        """Get agent conversation history from Firestore."""
        db = init_firestore_sync()
        history_ref = (
            db.collection("users")
            .document(self.owner_id)
            .collection("agents")
            .document(self.id)
            .collection("history")
            .order_by("timestamp", direction="ASCENDING")
        )
        history: list[HumanMessage | AIMessage] = []
        for doc in history_ref.stream():
            data = doc.to_dict()
            if data["role"] == "user":
                history.append(HumanMessage(content=data["content"]))
            else:
                history.append(AIMessage(content=data["content"]))
        return history

    @abstractmethod
    def run(self, inputs: list[HumanMessage | AIMessage]) -> str:
        pass

    @abstractmethod
    def arun(self, inputs: list[HumanMessage | AIMessage]) -> Generator:
        pass
