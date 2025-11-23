import api from './index';
import { getAuth } from 'firebase/auth';

export interface Agent {
  uuid: string;
  name: string;
  model: string;
  sessions: Array<string>;
  description?: string;
  icon?: string;
  knowledge_base?: string;
  tools?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: string;
  role?: string;
  tokens?: number;
}

export interface Session {
  session_id: string;
  messages: Message[];
}

export async function getAgents(): Promise<Array<Agent>> {
  const res = await api.get('/agents');
  return res.data;
}

export async function createAgent(data: Map<string, string>): Promise<Agent> {
  const res = await api.post('/agents', data);
  return res.data;
}

export async function getAgent(agentId: string): Promise<Agent> {
  const res = await api.get(`/agents/${agentId}`);
  return res.data;
}

export async function getOrCreateSession(agentId: string): Promise<Session> {
  const res = await api.get(`/agents/${agentId}/sessions/`);
  return res.data;
}

export async function sendMessage(
  agentId: string,
  sessionId: string,
  content: string
): Promise<Message> {
  const res = await api.post(`/agents/${agentId}/sessions/${sessionId}/messages`, {
    content,
  });
  return res.data;
}

/**
 * Create a WebSocket connection for real-time chat with streaming support
 */
export function createChatWebSocket(
  agentId: string,
  sessionId: string,
  onMessage: (message: Message) => void,
  onError?: (error: Event) => void,
  onClose?: (event: CloseEvent) => void,
  onStreamChunk?: (chunk: string) => void,
  onStreamStart?: () => void,
  onStreamEnd?: () => void
): WebSocket {
  const wsUrl = import.meta.env.VITE_API_URL.replace('http', 'ws');

  const ws = new WebSocket(`${wsUrl}/agents/${agentId}/sessions/${sessionId}/ws`);

  // Track streaming state
  let currentStreamingMessage = '';
  let currentRunId = '';

  ws.onopen = async () => {
    console.log('WebSocket connection established');

    // Send authentication token on connection
    const user = getAuth().currentUser;
    if (user) {
      const token = await user.getIdToken();
      ws.send(JSON.stringify({ type: 'auth', token }));
    }
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      // Handle streaming events from the backend
      if (data.type === 'started') {
        console.log('Agent started responding');
        currentStreamingMessage = '';
        currentRunId = data.data.run_id;
        if (onStreamStart) onStreamStart();
      } else if (data.type === 'content') {
        // Accumulate content chunks
        const chunk = data.data;
        currentStreamingMessage += chunk;
        console.log('Received chunk:', chunk);
        if (onStreamChunk) {
          onStreamChunk(chunk);
        }
      } else if (data.type === 'content_completed') {
        console.log('Content stream completed');
      } else if (data.type === 'completed') {
        // Final message with complete content
        console.log('Run completed with full content:', data.data.content);
        const message: Message = {
          id: currentRunId || `msg-${Date.now()}`,
          content: data.data.content,
          sender: 'agent',
          timestamp: new Date().toISOString(),
          role: 'assistant',
          tokens: data.data.metrics?.total_tokens,
        };
        onMessage(message);
        if (onStreamEnd) onStreamEnd();
        // Reset streaming state
        currentStreamingMessage = '';
        currentRunId = '';
      } else if (data.type === 'error') {
        console.error('WebSocket error:', data.error);
        if (onStreamEnd) onStreamEnd();
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    if (onError) {
      onError(error);
    }
  };

  ws.onclose = (event) => {
    console.log('WebSocket connection closed:', event.code, event.reason);
    if (onClose) {
      onClose(event);
    }
  };

  return ws;
}

/**
 * Send a message through WebSocket
 * Note: Chat history is automatically handled by the backend via Firestore
 */
export function sendWebSocketMessage(ws: WebSocket, content: string): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: 'message',
        content,
      })
    );
  } else {
    console.error('WebSocket is not open. ReadyState:', ws.readyState);
  }
}
