import pytest

from app.agents.agent import Agent
from tests.conftest import vertexai_model


@pytest.mark.parametrize(
    "id, name, model, status, description, system_message, knowledge_base, tools",
    [
        (
            "test_id",
            "Test Agent",
            vertexai_model,
            "idle",
            "Agent for unittesting.",
            "You are a test agent",
            None,
            None,
        )
    ],
)
def test_agent(
    id, name, model, status, description, system_message, knowledge_base, tools
):
    agent = Agent(
        id=id,
        name=name,
        model=model,
        status=status,
        description=description,
        system_message=system_message,
        knowledge_base=knowledge_base,
        tools=tools,
    )
    isinstance(agent, Agent)


def test_arun(agent):
    for event in agent.arun(
        {"messages": [{"role": "user", "content": "Tell me a fun fact fom history."}]}
    ):
        print(f"EVENT: {event}")
