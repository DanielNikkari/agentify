import pytest
from langchain.messages import AIMessage, HumanMessage

from app.agents.agent import Agent


@pytest.mark.parametrize(
    "id, name, model, status, description, system_message, knowledge_base, tools",
    [
        (
            "test_id",
            "Test Agent",
            "gemini-2.5-flash",
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


def test_run(agent):
    response = agent.run([HumanMessage("Write me a haiku about spring.")])
    isinstance(response, list)
    isinstance(all(response), HumanMessage | AIMessage)


def test_arun(agent):
    for event in agent.arun([HumanMessage("Tell me a fun fact fom history.")]):
        pass
    isinstance(event[0], AIMessage)
