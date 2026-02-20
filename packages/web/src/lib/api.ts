import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export interface Conversation {
  phone: string;
  lastMessage: any;
  lastCreatedAt: string;
  messageCount: number;
}

export interface Message {
  id: string;
  messageId: string;
  phone: string;
  direction: 'MT' | 'MO';
  status: string;
  payload: any;
  agentId: string;
  createdAt: string;
  deliveredAt: string | null;
  readAt: string | null;
  revokedAt: string | null;
}

export interface AppConfig {
  webhookUrl: string;
  webhookTimeoutMs: number;
  deliveryReportDeliveredPct: number;
  deliveryReportReadPct: number;
  deliveryReportIsTypingEnabled: boolean;
  deliveryReportDelayMs: number;
  agentId: string;
}

export const fetchConversations = () =>
  api.get<Conversation[]>('/conversations').then((r) => r.data);

export const fetchMessages = (phone: string) =>
  api.get<Message[]>(`/conversations/${encodeURIComponent(phone)}/messages`).then((r) => r.data);

export const fetchMessage = (id: string) =>
  api.get<Message>(`/messages/${id}`).then((r) => r.data);

export const composeMessage = (body: {
  phone: string;
  text?: string;
  suggestionResponse?: { postbackData: string; text: string };
  userFile?: any;
  location?: { latitude: number; longitude: number };
}) => api.post('/compose', body).then((r) => r.data);

export const fetchConfig = () =>
  api.get<AppConfig>('/config').then((r) => r.data);

export const setConfigValue = (key: string, value: string) =>
  api.put<AppConfig>(`/config/${key}`, { value }).then((r) => r.data);

export const resetConfigValue = (key: string) =>
  api.delete<AppConfig>(`/config/${key}`).then((r) => r.data);

export default api;
