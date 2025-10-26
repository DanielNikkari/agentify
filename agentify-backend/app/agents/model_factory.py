"""
Handle LLM model setup and registry.
"""

import os
from typing import Callable

import dotenv
from agno.models.base import Model
from agno.models.google import Gemini

dotenv.load_dotenv()


def require_env(vars: list[str]):
    missing = [v for v in vars if not os.getenv(v)]
    if missing:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing)}"
        )


# Model Registry - Add new models here.
MODEL_REGISTRY: dict[str, Callable[..., object]] = {
    "gemini-2.5-flash": lambda temperature, thinking: (
        require_env(
            [
                "GOOGLE_APPLICATION_CREDENTIALS",
                "GOOGLE_CLOUD_PROJECT",
                "GOOGLE_CLOUD_REGION",
            ]
        ),
        Gemini(
            id="gemini-2.5-flash",
            project_id=os.environ.get("GOOGLE_CLOUD_PROJECT"),
            location=os.environ.get("GOOGLE_CLOUD_REGION"),
            temperature=temperature,
            thinking_budget=-1 if thinking else False,
            vertexai=True,
        ),
    )[-1]
}


def get_model(model_name: str, temperature: float, thinking: bool = False) -> Model:
    """
    Get GenAI model.
    Args:
        model_name(str): model name.
        temperature(float): temperature of the model (0.0-2.0).
        thinking(bool): true for giving model thinking budget, otherwise false.
    Returns:
        Model: created LLM model object instance.
    """
    if model_name not in MODEL_REGISTRY:
        raise ValueError(
            f"Model {model_name} not found. Available: {list(MODEL_REGISTRY.keys())}"
        )
    if not (0.0 <= temperature <= 2.0):
        raise ValueError(f"Temperature value {temperature} not in range 0.0-2.0.")
    return MODEL_REGISTRY[model_name](temperature, thinking)


def get_available_models() -> list[str]:
    """
    Return list of available models.
    Returns:
        list[str]: List of models in model registry (available models)
    """
    return list(MODEL_REGISTRY.keys())
