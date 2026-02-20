import { create } from 'zustand';
import type { Message, Conversation } from '../lib/api';

interface AppState {
  conversations: Conversation[];
  setConversations: (c: Conversation[]) => void;
  messages: Record<string, Message[]>;
  setMessages: (phone: string, msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  updateMessageStatus: (messageId: string, phone: string, status: string) => void;
  revokeMessage: (messageId: string, phone: string) => void;
  selectedPhone: string | null;
  setSelectedPhone: (phone: string | null) => void;
  selectedMessageId: string | null;
  setSelectedMessageId: (id: string | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  conversations: [],
  setConversations: (conversations) => set({ conversations }),

  messages: {},
  setMessages: (phone, msgs) =>
    set((s) => ({
      messages: { ...s.messages, [phone]: msgs },
    })),

  addMessage: (msg) =>
    set((s) => {
      const phone = msg.phone;
      const existing = s.messages[phone] ?? [];
      return {
        messages: { ...s.messages, [phone]: [msg, ...existing] },
      };
    }),

  updateMessageStatus: (messageId, phone, status) =>
    set((s) => {
      const msgs = s.messages[phone];
      if (!msgs) return s;
      return {
        messages: {
          ...s.messages,
          [phone]: msgs.map((m) =>
            m.messageId === messageId ? { ...m, status } : m,
          ),
        },
      };
    }),

  revokeMessage: (messageId, phone) =>
    set((s) => {
      const msgs = s.messages[phone];
      if (!msgs) return s;
      return {
        messages: {
          ...s.messages,
          [phone]: msgs.map((m) =>
            m.messageId === messageId ? { ...m, status: 'REVOKED' } : m,
          ),
        },
      };
    }),

  selectedPhone: null,
  setSelectedPhone: (phone) => set({ selectedPhone: phone }),

  selectedMessageId: null,
  setSelectedMessageId: (id) => set({ selectedMessageId: id }),
}));
