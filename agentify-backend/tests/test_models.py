import pytest
from agno.models.google import Gemini

from app.agents.models import get_model


@pytest.mark.parametrize(
    "model_name, temperature, thinking", [("gemini-2.5-flash", 1.0, True)]
)
def test_models(model_name, temperature, thinking):
    model = get_model(model_name, temperature, thinking)
    breakpoint()
    assert isinstance(model, Gemini)
