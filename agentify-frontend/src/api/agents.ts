import api from './index';
import { getAuth } from 'firebase/auth';

export interface Agent {
  uuid: string;
  name: string;
  model: string;
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

export async function getOrCreateSession(agentId: string): Promise<string> {
  const res = await api.get(`/agents/${agentId}/session`);
  return res.data.session_id;
}

export async function getMessages(agentId: string, sessionId: string): Promise<Array<Message>> {
  const res = await api.get(`/agents/${agentId}/sessions/${sessionId}/messages`);
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
 * Create a WebSocket connection for real-time chat
 */
export function createChatWebSocket(
  agentId: string,
  sessionId: string,
  onMessage: (message: Message) => void,
  onError?: (error: Event) => void,
  onClose?: (event: CloseEvent) => void
): WebSocket {
  const wsUrl = import.meta.env.VITE_API_URL.replace('http', 'ws');

  const ws = new WebSocket(`${wsUrl}/agents/${agentId}/sessions/${sessionId}/ws`);

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

      // Handle different message types
      if (data.type === 'message') {
        onMessage(data.message);
      } else if (data.type === 'error') {
        console.error('WebSocket error:', data.error);
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
