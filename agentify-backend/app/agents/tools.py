"""
Handle agent tools.
"""

from agno.tools import tool


@tool(
    name="search_database",
    requires_confirmation=True,
    description="Test tool for tool calling.",
)
def search_database(query: str, limit: int = 10) -> str:
    """Search the customer database for records matching the query.

    Args:
        query: Search terms to look for
        limit: Maximum number of results to return
    """
    return f"Found {limit} results for '{query}'"
