"""
Agent instance
"""

from typing import Generator

from langchain.agents import create_agent
from langgraph.graph.state import StateGraph

from app.agents.base import Agentify


class Agent(Agentify):
    """
    LLM Agent instance.
    """

    def __init__(
        self,
        id: str,
        name: str,
        model: str,
        status: str,
        description: str | None = None,
        system_message: str | None = None,
        knowledge_base=None,
        tools=None,
    ):
        self._id = id
        self._name = name
        self._model = model
        self._status = status
        self._description = description
        self._system_message = system_message
        self.knowledge_base = knowledge_base
        self.tools = tools

        self.graph = self._init_graph()

    @property
    def id(self) -> str:
        return self._id

    @property
    def name(self) -> str:
        return self._name

    @property
    def description(self) -> str:
        return self._description or ""

    @property
    def status(self) -> str:
        return self._status

    @property
    def system_message(self) -> str:
        return self._system_message or ""

    @property
    def model(self) -> str:
        return self._model

    def _init_graph(self) -> StateGraph:
        """Create LangChain graph instance (StateGraph)"""
        return create_agent(
            model=self.model,
            tools=self.tools,
            system_prompt=self.system_message,
            store=self.knowledge_base,
        )

    def run(self, inputs: dict) -> str:
        return self.graph.invoke(inputs)

    def arun(self, inputs: dict) -> Generator:
        for chunk in self.graph.stream(inputs, stream_mode="updates"):
            yield (chunk)
