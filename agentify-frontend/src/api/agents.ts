import api from './index';

export interface Agent {
  uuid: string;
  name: string;
  model: string;
  description?: string;
  icon?: string;
  knowledge_base?: string;
  tools?: string;
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
