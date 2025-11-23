"""
Agentify instance.
"""

import logging
import os
from dataclasses import field
from typing import Any, Callable, Generator

import dotenv
from agno.agent import RunContentEvent
from agno.agent.agent import Agent as AgnoAgent
from agno.db.firestore import FirestoreDb
from agno.models.message import Message
from agno.tools import Toolkit
from agno.tools.function import Function
from agno.utils.pprint import pprint_run_response
from pydantic.dataclasses import dataclass

from app.agents.base import Agentify
from app.agents.exceptions import (
    AgentInvokationError,
)
from app.agents.model_factory import get_model
from app.agents.tools import search_database
from app.core.firestore import init_firestore_sync

logger = logging.getLogger(__name__)

dotenv.load_dotenv()


@dataclass
class State:
    """
    Input state for the agent.
    Defines the initial structure for A2A conversational messages.
    """

    messages: list[Message] = field(default_factory=list)


class Agent(Agentify):
    """
    Agno agent with Firestore integration.
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
        max_history_messages_in_context: int = 5,
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
        self._max_messages = max_history_messages_in_context
        self._firestore_client = init_firestore_sync()

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
            db=FirestoreDb(
                db_client=self._firestore_client,
                project_id=os.getenv("GOOGLE_CLOUD_PROJECT"),
                session_collection=f"users/{self._owner_id}/agents/{self._id}/sessions",
            ),
            add_history_to_context=True,
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
    def agent(self) -> AgnoAgent:
        return self._agent

    def run(self, user_input: str, user_name: str) -> Message:
        """
        Invoke agent synchronously.
        Args:
            user_input (str): Input to be sent to the agent.
            user_name (str): Name of the user from which the message is received.
        Returns:
            Message: Response from the agent.
        """
        try:
            input_message = Message(role="user", content=user_input, name=user_name)
            response: RunContentEvent = self._agent.run(
                input=input_message,
                user_id=self._user_id,
                session_id=self._session_id,
            )
            logger.debug(pprint_run_response(response, markdown=True))
            if response.is_paused:
                response = self._handle_tool_confirmation(response=response)
            response_message = response.messages[-1]
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

    def stream(self, user_input: str, user_name: str) -> Generator[RunContentEvent]:
        """
        Stream agent response.
        Args:
            user_input (str): Input to be sent to the agent.
            user_name (str): Name of the user from which the message is received.
        Returns:
            Generator[RunContentEvent]: Agent response generator.
        """
        try:
            input_message = Message(role="user", content=user_input, name=user_name)
            response: RunContentEvent = self._agent.run(
                input=input_message,
                user_id=self._user_id,
                session_id=self._session_id,
                stream=True,
                stream_intermediate_steps=True,
            )
            for chunk in response:
                if chunk.is_paused:
                    # Handle tool confirmation inline for streaming mode
                    for tool in chunk.tools_requiring_confirmation:
                        logger.info(
                            f"Tool {tool.tool_name}({tool.tool_args}) requires confirmation"
                        )
                        confirmed = input("Confirm? (y/n): ").lower() == "y"
                        tool.confirmed = confirmed
                    # Don't yield the paused chunk; continue iterating
                    # The stream will automatically continue after confirmation
                    continue
                yield chunk
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
            for chunk in self._agent.arun(
                input_message, user_id=self._user_id, session_id=self._session_id
            ):
                response = chunk
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

    def _handle_tool_confirmation(self, response: RunContentEvent) -> RunContentEvent:
        """TODO: Improve handling so that it shows a message to the user on frontend."""
        for tool in response.tools_requiring_confirmation:
            # Get user confirmation
            logger.info(
                f"Tool {tool.tool_name}({tool.tool_args}) requires confirmation"
            )
            confirmed = input("Confirm? (y/n): ").lower() == "y"
            tool.confirmed = confirmed
        return self._agent.continue_run(run_response=response)
