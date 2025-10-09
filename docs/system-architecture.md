# 🏗️ System Architecture — Agentify v1.0

_Last updated: 2025-10-09_

## 📘 Overview

Agentify is a **serverless agentic platform** built on **Google Cloud Platform (GCP)**.  
It enables users to create, configure, and interact with AI agents powered by Vertex AI and managed via Firebase.  

The system architecture is fully **serverless**, **scalable**, and **cost-efficient**, with a target uptime of 99% and minimal idle costs (< 10€/month in demo mode).

---

## ☁️ High-Level Architecture

**Frontend**
- Built using **React (Vite)** hosted on **Firebase Hosting**
- Communicates with backend services via HTTPS and WebSockets
- Uses **Firebase Authentication** for user management

**Backend**
- Implemented as serverless containers running on **Cloud Run**
- Exposed via **API Gateway** for routing, authentication, and rate limiting
- Handles AI inference, data orchestration, and CRUD operations for agents

**AI Services**
- **Vertex AI** is used for model execution and embedding generation
- Future integration with **Vertex AI Vector Search** for production-grade retrieval

**Storage**
- **Cloud Firestore** stores structured data (agents, users, metadata)
- **Cloud Storage** holds unstructured data (documents, RAG files)
- Vector embeddings temporarily stored in **FAISS (in-memory)** or **GCS JSON blobs**

**Security & Access**
- **Firebase Authentication (JWT)** secures requests
- **API Gateway** enforces rate limits and auth validation
- Service-to-service calls within GCP use **IAM service accounts**

## 🔄 Data Flow Summary

1. **User Authentication**
   - User logs in via Firebase (Google, GitHub, or Email)
   - JWT is issued and included in all API requests

2. **Agent Creation**
   - Frontend sends POST `/agents` to Cloud Run
   - Cloud Run stores agent data in Firestore
   - Firestore triggers optional Cloud Function for event logging

3. **RAG Pipeline**
   - User uploads documents via `/rag/upload`
   - Cloud Run vectorizes data using Vertex AI Embeddings
   - Resulting vectors are saved temporarily in Cloud Storage (prototype)  
     → Later: Vertex Vector Search for production scalability

4. **Chat Query**
   - Frontend sends `/chat/query` with message and agent ID
   - Cloud Run fetches context vectors + agent configuration
   - Vertex AI generates response
   - Result is returned to frontend and optionally cached in Firestore

---

## 🧠 Core Components

| Component | Platform | Description |
|------------|-----------|--------------|
| **Frontend (UI)** | Firebase Hosting | React app for user interaction |
| **Auth** | Firebase Authentication | Manages login, JWT, and user sessions |
| **API Gateway** | GCP API Gateway | Routes traffic, enforces limits |
| **Backend** | Cloud Run | Stateless containerized API logic |
| **AI Engine** | Vertex AI | LLM inference, embedding generation |
| **Vector Store** | FAISS / Vertex AI Vector Search | Semantic retrieval of document chunks |
| **Data Store** | Firestore | Persistent metadata store |
| **File Store** | Cloud Storage | RAG documents and unstructured files |
| **MCP Servers** | External | Provide tool/data access for agents |


---

## 🔐 Security Architecture

| Layer | Mechanism |
|-------|------------|
| **Authentication** | Firebase JWTs (Bearer token in header) |
| **Authorization** | Role-based (admin / demo) via Firestore claims |
| **Transport** | HTTPS/TLS enforced at API Gateway |
| **Isolation** | IAM service accounts for backend services |
| **Rate Limiting** | Managed by API Gateway per Firebase UID |
| **Data Privacy** | User-specific Firestore collections, no cross-access |

---

## ⚙️ Deployment and Scalability

| Feature | Implementation |
|----------|----------------|
| **Scalability** | Cloud Run auto-scales based on request load |
| **Idle Cost** | Scales to zero when unused |
| **CI/CD** | GitHub → Cloud Build → Cloud Run |
| **Monitoring** | Cloud Logging & Cloud Trace |
| **Error Handling** | Structured JSON errors from backend (see api-contracts.md) |

---

## 🧩 Infrastructure Diagram

<img src="/docs/diagrams/agentify-app.png" alt="agnetify infrastructure diagram">

## 🧩 References
- [API Contracts Documentation](./api-contracts.md)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Google Cloud Run Docs](https://cloud.google.com/run/docs)