"""
Custom expecptions for app.agents logic.
"""


class LangGraphAgentInitError(Exception):
    """Raised if LangGraph agent initiation fails."""


class AgentInvokationError(Exception):
    """Raised when there is an error invoking the agent."""


class HistoryFetchingError(Exception):
    """Raised when fetching agent history from Firestore fails."""
