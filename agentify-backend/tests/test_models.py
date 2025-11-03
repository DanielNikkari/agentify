import pytest
from agno.models.base import Model

from app.agents.model_factory import get_available_models, get_model


@pytest.mark.parametrize(
    "model_name, temperature, thinking", [("gemini-2.5-flash", 1.0, True)]
)
def test_vertexai_model(model_name, temperature, thinking):
    """
    >>> uv run pytest tests/test_models.py::test_vertexai_model -s
    """
    model = get_model(model_name, temperature, thinking)
    assert isinstance(model, Model)


def test_get_available_models():
    """
    >>> uv run pytest tests/test_models.py::test_get_available_models -s
    """
    available_models: list[str] = get_available_models()
    assert isinstance(available_models, list)
