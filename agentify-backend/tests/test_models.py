import pytest
from langchain_google_vertexai import ChatVertexAI

from app.agents.model_factory import get_model


@pytest.mark.parametrize(
    "model_name, temperature, thinking", [("gemini-2.5-flash", 1.0, True)]
)
def test_vertexai_model(model_name, temperature, thinking):
    model = get_model(model_name, temperature, thinking)
    assert isinstance(model, ChatVertexAI)
