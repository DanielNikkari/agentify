# API Contracts — agentify v1.0
Defines the request/response data structures and endpoints for the agentify platform.

_Last updated: 2025-10-09_

## 📚 Table of Contents
- [Overview](#-overview)
- [Authentication Endpoints](#-authentication-endpoints)
- [Agents Endpoints](#-agents-endpoints)
- [RAG / Knowledge Base](#-rag--knowledge-base-endpoints)
- [Chat Endpoints](#-chat-endpoints)
- [MCP / Tools](#-mcp--tools-endpoints)
- [Firestore Schema Reference](#-firestore-schema-reference)
- [Error Format](#️-error-format)
- [Developer Notes](#-developer-notes)

---

## 🧭 Overview

**Base URL**
https://api.agentify.app/v1

**Auth Method**
- Firebase JWT in `Authorization` header
- Format:  Bearer

**Content Type**
application/json

**Rate Limits**
- Default: 60 requests/minute to non-AI-endpoints and 10 requests/minute to AI-endpoints (handled by API gateway)
- Limits are configured based on the plan and role

---

**Responses**
- `200 OK`: Success  
- `400 BAD REQUEST`: Missing or invalid parameters  
- `401 UNAUTHORIZED`: Invalid or expired token  
- `404 NOT FOUND`: Resource not found  
- `500 INTERNAL SERVER ERROR`: Server failure

## 🔐 Authentication Endpoints

### `POST /auth/login`
Authenticate a user using Firebase or third-party provider.

**Request**
```json
{
  "provider": "github | google | email",
  "email": "optional@example.com",
  "password": "optional"
}
```

**Response**
```json
{
  "uid": "string",
  "displayName": "string",
  "email": "string",
  "token": "string (JWT)",
  "plan": "demo | admin",
  "createdAt": "timestamp"
}
```

### `POST /auth/validate`
Validate the JWT for active session.

**Response**
```json
{
  "valid": true,
  "uid": "string",
  "role": "admin | user",
  "tier": "free | pro"
}
```

## 👥 Agents Endpoints

### `GET /agents`
Get a list of all user-created AI agents.

**Response**
```json
[
  {
    "id": "agent-uuid",
    "name": "Berte Fahrenwald",
    "model": "gemini-2.5-flash",
    "knowledgeBase": "finance_kb",
    "tools": ["calendar", "email"],
    "status": "active | inactive | error",
    "createdAt": "timestamp"
  }
]
```

### `POST /agents`
Create a new AI agent.

**Request**
```json
{
  "name": "New Agent",
  "model": "gpt-5",
  "knowledgeBase": "kb_finance",
  "tools": ["search", "code"]
}
```

**Response**
```json
{
  "id": "agent-uuid",
  "createdAt": "timestamp"
}
```

### `DELETE /agents/:id`
Remove a user’s agent.

**Response**
```json
{ "success": true }
```

## 🧠 RAG / Knowledge Base Endpoints

### `POST /rag/upload`
Upload documents for embedding and vectorization.

**Request**
```
Content-Type: multipart/form-data
files[] = <documents>
```

**Response**
```json
{
  "uploaded": 3,
  "vectorStoreId": "vector-uuid",
  "embeddingModel": "textembedding-gecko",
  "status": "success"
}
```

### `GET /rag/pipelines`
List all vector pipelines available to the user.

**Response**
```json
[
  {
    "id": "pipeline-uuid",
    "name": "customer_support_docs",
    "documentCount": 25,
    "createdAt": "timestamp"
  }
]
```

## 💬 Chat Endpoints

### `POST /chat/query`
Send a chat message to an AI agent.

**Request**
```json
{
  "agentId": "agent-uuid",
  "message": "Explain the latest report metrics",
  "context": "optional",
  "attachments": ["doc1.pdf"]
}
```

**Response**
```json
{
  "response": "The report shows a 12% increase in conversions.",
  "tokensUsed": 542,
  "inputTokensUsed": 400,
  "outputTokensUsed": 142,
  "timestamp": "timestamp"
}
```

## 🔧 MCP / Tools Endpoints

### `GET /tools`
Fetch available MCP tools connected to system.

**Response**
```json
[
  { "id": "calendar", "status": "connected" },
  { "id": "docs", "status": "inactive" }
]
```

## 💾 Firestore Schema Reference

**users Collection**
```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "role": "admin | demo",
  "tier": "free | pro",
  "createdAt": "timestamp"
}
```

**agents Collection**
```json
{
  "id": "string",
  "userId": "uid",
  "name": "string",
  "model": "string",
  "knowledgeBase": "string",
  "tools": ["string"],
  "status": "active | inactive",
  "createdAt": "timestamp"
}
```

## ⚙️ Error Format
All errors follow this structure:

```json
{
  "error": true,
  "code": "string",
  "message": "Readable explanation of the problem"
}
```

## 🧑‍💻 Developer Notes
- All timestamps are ISO 8601 strings (`2025-10-09T12:34:56Z`).
- UUIDs follow v4 format.
- Multipart uploads are capped at 10MB per file.

--- 
> **Versioning Policy:**  
> Breaking changes will increment the major version (`/v2`, `/v3`).  
> Minor or additive changes will be released under `/v1.x` without altering existing contracts.