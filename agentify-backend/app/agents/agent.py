"""
LangGraph Agent instance.
"""

import logging
from dataclasses import field
from typing import Any, Callable, Generator

import google.cloud.firestore as fs
from agno.agent import RunContentEvent
from agno.agent.agent import Agent as AgnoAgent
from agno.models.message import Message
from agno.tools import Toolkit
from agno.tools.function import Function
from pydantic.dataclasses import dataclass

from app.agents.base import Agentify
from app.agents.exceptions import (
    AgentInvokationError,
    HistoryFetchingError,
    HistoryUpdateError,
)
from app.agents.model_factory import get_model
from app.agents.tools import search_database
from app.core.firestore import init_firestore_sync

logger = logging.getLogger(__name__)


@dataclass
class State:
    """
    Input state for the agent.
    Defines the initial structure for A2A conversational messages.
    """

    messages: list[Message] = field(default_factory=list)


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
        user_id: str | None = None,
        session_id: str | None = None,
        role: str | None = None,
        description: str | None = None,
        system_message: str | None = None,
        instructions: list[str] | None = None,
        temperature: float | None = None,
        thinking: bool = False,
        reasoning: bool = False,
        knowledge_base: Any = None,
        tools: list[Toolkit, Callable, Function, dict] = list(),
    ):
        self._id = id
        self._owner_id = owner_id
        self._user_id = user_id
        self._session_id = session_id
        self._name = name
        self._model = get_model(
            model_name=model, temperature=temperature or 1.0, thinking=thinking
        )
        self._status = status
        self._role = role
        self._description = description
        self._system_message = system_message
        self._instructions = instructions
        self.knowledge_base = knowledge_base
        self.tools = tools or [search_database]

        try:
            self._conversation_history: list[Message] = self._get_conversation_history()
        except HistoryFetchingError:
            self._conversation_history = []

        self._agent = AgnoAgent(
            name=self._name,
            role=self._role,
            user_id=self._user_id,
            session_id=self._session_id,
            model=self.model,
            tools=self.tools,
            system_message=self.system_message,
            instructions=self._instructions,
            description=self._description,
            reasoning=reasoning,
            knowledge=self.knowledge_base,
            add_datetime_to_context=True,
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
    def user_id(self) -> str:
        return self._user_id

    @property
    def session_id(self) -> str:
        return self._session_id

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
    def history(self) -> list[Message]:
        return self._conversation_history

    @property
    def agent(self) -> AgnoAgent:
        return self._agent

    def _get_conversation_history(self):
        """Get agent conversation history."""
        try:
            return self._get_friestore_agent_conversation_history()
        except Exception:
            logger.error(
                f"Failed to get agent history from Firestore. (agent_id={self._id})",
                exc_info=True,
            )
            raise HistoryFetchingError(
                "Failed to get agent history from Firestore"
            ) from None

    def _update_history(self, message: Message) -> None:
        """Update conversation history."""
        try:
            self._conversation_history = self._conversation_history + [message]
            self._update_firestore_agent_history(message)
        except Exception:
            logger.error(
                f"Failed to update agent's conversation history on Firestore (agent_id={self._id})",
                exc_info=True,
            )
            raise HistoryUpdateError(
                f"Failed to update agent's conversation history on Firestore (agent_id={self._id})"
            ) from None

    def run(self, input: str, user_name: str) -> Message:
        """
        Invoke agent synchronously.
        Args:
            input (str): Input to be sent to the agent.
            user_name (str): Name of the user from which the message is received.
        Returns:
            Message: Response from the agent.
        """
        try:
            input_message = Message(role="user", content=input, name=user_name)
            self._update_history(input_message)
            response: RunContentEvent = self._agent.run(
                self._conversation_history,
                user_id=self._user_id,
                session_id=self._session_id,
            )
            response_message = response.messages[-1]
            self._update_history(response_message)
            logger.info(
                f"input_tokens={response_message.metrics.input_tokens}, output_tokens={response_message.metrics.output_tokens}, total_tokens={response_message.metrics.total_tokens}"
            )
            return response_message
        except Exception:
            logger.error(
                f"Error invoking the agent {self._name} (agent_id={self._id})",
                exc_info=True,
            )
            raise AgentInvokationError(
                f"Error invoking agent {self._name} (agent_id={self._id})"
            ) from None

    def stream(self, input: str, user_name: str) -> Generator[RunContentEvent]:
        """
        Stream agent response.
        Args:
            input (str): Input to be sent to the agent.
            user_name (str): Name of the user from which the message is received.
        Returns:
            Generator[RunContentEvent]: Agent response generator.
        """
        try:
            input_message = Message(role="user", content=input, name=user_name)
            self._update_history(input_message)
            response: RunContentEvent = self._agent.run(
                self._conversation_history,
                user_id=self._user_id,
                session_id=self._session_id,
                stream=True,
            )
            final_chunk = None
            for chunk in response:
                breakpoint()
                yield chunk
                final_chunk = chunk
            self._update_history(
                Message(
                    role="assistant",
                    content=final_chunk.content,
                    name=final_chunk.agent_name,
                    tool_calls=final_chunk.tools,
                )
            )
        except Exception:
            logger.error(
                f"Error invoking the agent {self._name} (agent_id={self._id})",
                exc_info=True,
            )
            raise AgentInvokationError(
                f"Error invoking agent {self._name} (agent_id={self._id})"
            ) from None

    def arun(self, input: str, user_name: str) -> Generator:
        """
        Invoke agent asynchronously. Streams updates.
        Args:
            input (str): Input to be sent to the agent.
            user_name (str): Name of the user from which the message is received.
        Returns:
            AIMessage: Response from the agent.
        """
        try:
            input_message = Message(role="user", content=input, name=user_name)
            self._update_history(input_message)
            for chunk in self._agent.arun(
                input_message, user_id=self._user_id, session_id=self._session_id
            ):
                response = chunk
                breakpoint()
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

    def _get_friestore_agent_conversation_history(self) -> list[Message]:
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
        history: list[Message] = []
        for doc in history_ref.stream():
            data = doc.to_dict()
            history.append(
                Message(
                    role=data["role"],
                    content=data["content"],
                    name=data["name"],
                    tool_calls=data["tool_calls"],
                )
            )
        return history

    def _update_firestore_agent_history(self, message: Message) -> None:
        """Update agent history to the Firestore."""
        db = init_firestore_sync()
        history_ref = (
            db.collection("users")
            .document(self.owner_id)
            .collection("agents")
            .document(self.id)
            .collection("history")
        )
        history_ref.add(
            {
                "role": message.role,
                "content": message.content,
                "name": message.name,
                "tool_calls": message.tool_calls,
                "timestamp": fs.SERVER_TIMESTAMP,
            }
        )
