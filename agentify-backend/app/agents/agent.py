"""
Agent instance
"""

import logging
from typing import Any, Generator

from langchain.agents import create_agent
from langchain.messages import AIMessage, HumanMessage
from langgraph.graph.state import StateGraph

from app.agents.base import Agentify
from app.agents.model_factory import get_model

logger = logging.getLogger(__name__)


class AgentInvokationError(Exception):
    """Raised when there is an error invoking the agent."""


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
        temperature: float | None = None,
        thinking: bool = False,
        knowledge_base: Any = None,
        tools: Any = None,
    ):
        self._id = id
        self._name = name
        self._model = get_model(
            model_name=model, temperature=temperature or 1.0, thinking=thinking
        )
        self._status = status
        self._description = description
        self._system_message = system_message
        self.knowledge_base = knowledge_base
        self.tools = tools

        self.graph = self._init_graph()

        logger.info(f"Initiated agent instance: id={self._id}, name={self._name}")

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

    def run(
        self, inputs: list[HumanMessage | AIMessage], conversation_id: str | None = None
    ) -> list[HumanMessage | AIMessage]:
        """Invoke agent synchronously."""
        try:
            inputs = {"messages": inputs}
            response = self.graph.invoke(inputs)
            # TODO: request and token tracking
            return response.get("messages")
        except Exception:
            logger.error(
                f"Error invoking the agent {self._name} ({self._id})", exc_info=True
            )
            raise AgentInvokationError(f"Error invoking agent {self._name}")

    def arun(
        self, inputs: list[HumanMessage | AIMessage], conversation_id: str | None = None
    ) -> Generator:
        """Invoke agent asynchronously."""
        try:
            # TODO: request and token tracking
            inputs = {"messages": inputs}
            for chunk in self.graph.stream(inputs, stream_mode="updates"):
                yield (chunk.get("model").get("messages"))
        except Exception:
            logger.error(
                f"Error invoking the agent {self._name} ({self._id})", exc_info=True
            )
            raise AgentInvokationError(f"Error invoking agent {self._name}")
