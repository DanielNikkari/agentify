import pytest

from app.agents.agent import Agent
from app.agents.model_factory import get_model


@pytest.fixture(scope="session")
def vertexai_model():
    return get_model("gemini-2.5-flash", 1.0, True)


@pytest.fixture(scope="session")
def agent():
    return Agent(
        id="test_id",
        name="Test Agent",
        model="gemini-2.5-flash",
        status="idle",
        description="Agent for unittesting.",
        system_message="You are a test agent",
        knowledge_base=None,
        tools=None,
    )
