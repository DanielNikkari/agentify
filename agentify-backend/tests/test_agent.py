import pytest
from langchain.messages import AIMessage, HumanMessage

from app.agents.agent import Agent


@pytest.mark.parametrize(
    "id, owner_id, name, model, status, role, description, system_message, temperature, knowledge_base, tools",
    [
        (
            "test_id",
            "test_owner_id",
            "Test Agent",
            "gemini-2.5-flash",
            "idle",
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
    >>> uv run pytest tests/test_agent.py::test_sync_conversation -s --user-id <user-id> --agent-id <agent-id>
    """
    response = agent.run([HumanMessage("Write me a haiku about spring.")])
    isinstance(response, list)
    isinstance(all(response), HumanMessage | AIMessage)


def test_sync_conversation(agent):
    """
    >>> uv run pytest tests/test_agent.py::test_sync_conversation -s --user-id <user-id> --agent-id <agent-id>
    """
    while True:
        user_input = input("Your message:")
        if user_input == "exit":
            break
        response = agent.run(user_input, "testConvId")
        print(f"Agent response:\n{response}")


def test_arun(agent):
    """
    >>> uv run pytest tests/test_agent.py::test_sync_conversation -s --user-id <user-id> --agent-id <agent-id>
    """
    for event in agent.arun([HumanMessage("Tell me a fun fact fom history.")]):
        pass
    isinstance(event[0], AIMessage)


def test_async_conversation(agent):
    """
    >>> uv run pytest tests/test_agent.py::test_sync_conversation -s --user-id <user-id> --agent-id <agent-id>
    """
    while True:
        user_input = input("Your message:")
        if user_input == "exit":
            break
        for event in agent.arun(user_input, "testConvId"):
            print(f"Agent response:\n{event}")
