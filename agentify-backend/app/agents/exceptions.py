"""
Custom expecptions for app.agents logic.
"""


class AgentInvokationError(Exception):
    """Raised when there is an error invoking the agent."""


class HistoryFetchingError(Exception):
    """Raised when fetching agent history from Firestore fails."""


class HistoryUpdateError(Exception):
    """Raised when updating agent history fails."""
