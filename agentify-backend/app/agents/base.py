"""
Base class for LLM Agents.
"""

from abc import ABC, abstractmethod
from typing import Generator


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
    def run(self, inputs: dict) -> str:
        pass

    @abstractmethod
    def arun(self, inputs: dict) -> Generator:
        pass
