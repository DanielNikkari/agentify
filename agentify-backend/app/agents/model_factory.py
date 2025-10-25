"""
Handle LLM model setup and registry.
"""

import os
from typing import Callable

import dotenv
from langchain_google_vertexai import ChatVertexAI

dotenv.load_dotenv()


def require_env(var: str):
    if not os.getenv(var):
        raise EnvironmentError(f"Missing required environment variable: {var}")


# Model Registry - Add new models here.
MODEL_REGISTRY: dict[str, Callable[..., object]] = {
    "gemini-2.5-flash": lambda temperature, thinking: (
        require_env("GOOGLE_APPLICATION_CREDENTIALS"),
        ChatVertexAI(
            model="gemini-2.5-flash",
            temperature=temperature,
            thinking_budget=-1 if thinking else False,
        ),
    )[-1]
}


def get_model(model_name: str, temperature: float, thinking: bool = False):
    """
    Get GenAI model.
    Args:
        model_name(str): model name.
        temperature(float): temperature of the model (0.0-2.0).
        thinking(bool): true for giving model thinking budget, otherwise false.
    Returns:
        model: created AI model object instance.
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
    return MODEL_REGISTRY.keys()
