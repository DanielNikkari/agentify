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

    @abstractmethod
    def _init_graph(self) -> str:
        pass

    @abstractmethod
    def run(self, inputs: list[HumanMessage | AIMessage]) -> str:
        pass

    @abstractmethod
    def arun(self, inputs: list[HumanMessage | AIMessage]) -> Generator:
        pass
