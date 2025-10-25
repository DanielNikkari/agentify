import pytest

from app.agents.agent import Agent
from app.agents.model_factory import get_model


@pytest.fixture(scope="session")
def vertexai_model():
    return get_model("gemini-2.5-flash", 1.0, True)


@pytest.fixture(scope="session")
def agent(request):
    user_id = request.config.getoption("--user-id")
    agent_id = request.config.getoption("--agent-id")

    return Agent(
        id=agent_id or "test_id",
        owner_id=user_id or "test_owner_id",
        name="Marry Poppins",
        model="gemini-2.5-flash",
        status="idle",
        role="test role",
        description="Agent for unittesting.",
        system_message="You are a test agent",
        temperature=0.5,
        knowledge_base=None,
        tools=None,
    )


def pytest_addoption(parser):
    parser.addoption("--user-id", action="store", default=None)
    parser.addoption("--agent-id", action="store", default=None)
