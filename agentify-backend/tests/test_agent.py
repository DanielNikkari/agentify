import pytest
from agno.agent import RunContentEvent
from agno.models.message import Message

from app.agents.agent import Agent


@pytest.mark.parametrize(
    "id, owner_id, name, model, status, user_id, role, description, system_message, temperature, knowledge_base, tools",
    [
        (
            "test_id",
            "test_owner_id",
            "Test Agent",
            "gemini-2.5-flash",
            "idle",
            "user123",
            "Test role",
            "Agent for unittesting.",
            "You are a test agent",
            0.5,
            None,
            None,
        )
    ],
)
def test_agent(
    id,
    owner_id,
    name,
    model,
    status,
    user_id,
    role,
    description,
    system_message,
    temperature,
    knowledge_base,
    tools,
):
    agent = Agent(
        id=id,
        owner_id=owner_id,
        name=name,
        model=model,
        status=status,
        user_id=user_id,
        role=role,
        description=description,
        system_message=system_message,
        temperature=temperature,
        knowledge_base=knowledge_base,
        tools=tools,
    )
    isinstance(agent, Agent)


def test_run(agent):
    """
    >>> uv run pytest tests/test_agent.py::test_run -s --user-id <user-id> --agent-id <agent-id>
    """
    response = agent.run("Write me a haiku about spring.", user_name="Test User")
    isinstance(response, list)
    isinstance(all(response), Message)


def test_stream(agent):
    """
    >>> uv run pytest tests/test_agent.py::test_stream -s --user-id <user-id> --agent-id <agent-id>
    """
    for chunk in agent.stream("Write me a haiku about spring.", user_name="Test User"):
        isinstance(chunk, RunContentEvent)


def test_sync_conversation(agent):
    """
    >>> uv run pytest tests/test_agent.py::test_sync_conversation -s --user-id <user-id> --agent-id <agent-id>
    """
    while True:
        user_input = input("Your message:")
        if user_input == "exit":
            break
        response = agent.run(user_input, user_name="Test User")
        print(f"Agent response:\n{response}")


def test_arun(agent):
    """
    >>> uv run pytest tests/test_agent.py::test_sync_conversation -s --user-id <user-id> --agent-id <agent-id>
    """
    for event in agent.arun("Tell me a fun fact fom history."):
        pass
    isinstance(event[0], Message)


def test_streaming_conversation(agent):
    """
    >>> uv run pytest tests/test_agent.py::test_streaming_conversation -s --user-id <user-id> --agent-id <agent-id>
    """
    while True:
        user_input = input("Your message:")
        if user_input == "exit":
            break
        for event in agent.stream(user_input, "testConvId"):
            print(f"Agent response:\n{event}")
