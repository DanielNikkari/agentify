"""
LangGraph Agent instance.
"""

import logging
from dataclasses import field
from typing import Any, Generator, TypedDict

import google.cloud.firestore as fs
from langchain.agents import create_agent
from langchain.messages import AIMessage, HumanMessage
from langchain_core.runnables import RunnableConfig
from langgraph.graph.state import StateGraph
from pydantic.dataclasses import dataclass

from app.agents.base import Agentify
from app.agents.exceptions import AgentInvokationError, HistoryFetchingError
from app.agents.model_factory import get_model
from app.core.firestore import init_firestore_sync

logger = logging.getLogger(__name__)


class Context(TypedDict):
    """
    Context parameters for the agent.
    """

    agent_name: str
    agent_role: str | None
    agent_description: str | None
    agent_language: str | None
    user_name: str | None


@dataclass
class State:
    """
    Input state for the agent.
    Defines the initial structure for A2A conversational messages.
    """

    messages: list[HumanMessage | AIMessage] = field(default_factory=list)


class Agent(Agentify):
    """
    LangGraph agent with conversation history, state store, and context.
    """

    def __init__(
        self,
        id: str,
        owner_id: str,
        name: str,
        model: str,
        status: str,
        role: str | None = None,
        description: str | None = None,
        system_message: str | None = None,
        temperature: float | None = None,
        thinking: bool = False,
        knowledge_base: Any = None,
        tools: Any = None,
    ):
        self._id = id
        self._owner_id = owner_id
        self._name = name
        self._model = get_model(
            model_name=model, temperature=temperature or 1.0, thinking=thinking
        )
        self._status = status
        self._role = role
        self._description = description
        self._system_message = system_message
        self.knowledge_base = knowledge_base
        self.tools = tools

        try:
            self._conversation_history = self._get_conversation_history()
        except HistoryFetchingError:
            self._conversation_history = []

        self._graph = create_agent(
            model=self.model,
            tools=self.tools,
            system_prompt=self.system_message,
            store=self.knowledge_base,
            state_schema=State,
            context_schema=Context(
                agent_name=self._name,
                agent_role=self._role,
                agent_description=self._description,
            ),
        )
        logger.info(
            f"Initiated agent instance: id={self._id}, name={self._name}, role={self._role}, model={model}"
        )

    @property
    def id(self) -> str:
        return self._id

    @property
    def owner_id(self) -> str:
        return self._owner_id

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

    @property
    def history(self) -> list[HumanMessage | AIMessage]:
        return self._conversation_history

    @property
    def graph(self) -> StateGraph:
        return self._graph

    def _get_conversation_history(self):
        """Get agent conversation history."""
        try:
            return super()._get_conversation_history()
        except Exception:
            logger.error(
                f"Failed to get agent history from Firestore. (agent_id={self._id})",
                exc_info=True,
            )
            raise HistoryFetchingError(
                "Failed to get agent history from Firestore"
            ) from None

    def _update_history(self, message: HumanMessage | AIMessage) -> None:
        """Update conversation history."""
        self._conversation_history = self._conversation_history + [message]
        try:
            self._update_firestore_agent_history(message)
        except Exception:
            logger.error(
                f"Failed to update agent's conversation history on Firestore (agent_id={self._id})",
                exc_info=True,
            )

    def run(self, input: str, conversation_id: str) -> AIMessage:
        """
        Invoke agent synchronously.
        Args:
            input (str): Input to be sent to the agent.
            conversation_id (str): Conversation ID.
        Returns:
            AIMessage: Response from the agent.
        """
        try:
            config: RunnableConfig = {"configurable": {"thread_id": conversation_id}}
            self._update_history(HumanMessage(input))
            messages = {"messages": self._conversation_history}
            response = self._graph.invoke(messages, config=config).get("messages")[-1]
            self._update_history(response)
            logger.info(
                f"input_tokens={response.usage_metadata["input_tokens"]}, output_tokens={response.usage_metadata["output_tokens"]}, total_tokens={response.usage_metadata["total_tokens"]}"
            )
            return response
        except Exception:
            logger.error(
                f"Error invoking the agent {self._name} (agent_id={self._id})",
                exc_info=True,
            )
            raise AgentInvokationError(
                f"Error invoking agent {self._name} (agent_id={self._id})"
            ) from None

    def arun(self, input: str, conversation_id: str) -> Generator:
        """
        Invoke agent asynchronously. Streams updates.
        Args:
            input (str): Input to be sent to the agent.
            conversation_id (str): Conversation ID.
        Returns:
            AIMessage: Response from the agent.
        """
        try:
            config: RunnableConfig = {"configurable": {"thread_id": conversation_id}}
            self._update_history(HumanMessage(input))
            messages = {"messages": self._conversation_history}
            for chunk in self._graph.stream(
                messages, stream_mode="updates", config=config
            ):
                response = chunk.get("model").get("messages")[-1]
                self._update_history(response)
                yield response
            logger.info(
                f"input_tokens={response.usage_metadata["input_tokens"]}, output_tokens={response.usage_metadata["output_tokens"]}, total_tokens={response.usage_metadata["total_tokens"]}"
            )
        except Exception:
            logger.error(
                f"Error invoking the agent {self._name} ({self._id})", exc_info=True
            )
            raise AgentInvokationError(
                f"Error invoking agent {self._name} (agent_id={self._id})"
            ) from None

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

    def _update_firestore_agent_history(
        self, message: HumanMessage | AIMessage
    ) -> None:
        """Update agent history to the Firestore."""
        db = init_firestore_sync()
        history_ref = (
            db.collection("users")
            .document(self.owner_id)
            .collection("agents")
            .document(self.id)
            .collection("history")
        )
        role = "user" if isinstance(message, HumanMessage) else "agent"
        history_ref.add(
            {
                "role": role,
                "content": message.content,
                "timestamp": fs.SERVER_TIMESTAMP,
            }
        )
