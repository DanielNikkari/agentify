# ======================================= #
# 🐳 Dockerfile for building agentify backend
# image. Uses uv as package manager.
# Build and run commands:
#   docker build -t agentify-backend .
# and
#   docker run --name agentify-backend-container -t agentify-backend
# ======================================= #

# USE UV DISTRO IMAGE
FROM python:3.13-slim-trixie

# INSTALL LATEST UV BINARY
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# SET WORKING DIRECTORY
WORKDIR /agentify-backend

# COPY DEPENDENCY FILES FIRST
COPY pyproject.toml uv.lock ./

# INSTALL DEPENDENCIES
RUN uv sync --locked --no-cache

# COPY FILES FROM ROOT TO WORKING DIRECTORY
COPY . .

# SET ENVIRONMENT VARIABLES
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_NO_SYNC_WARNINGS=1

# RUN APP
CMD [ "uv", "run", "agentify_app.py" ]