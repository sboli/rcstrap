import { useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { useStore } from '../store/useStore';
import { useQueryClient } from '@tanstack/react-query';

export function useSocket() {
  const addMessage = useStore((s) => s.addMessage);
  const updateMessageStatus = useStore((s) => s.updateMessageStatus);
  const revokeMessage = useStore((s) => s.revokeMessage);
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    socket.on('message:new', (msg) => {
      addMessage(msg);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    socket.on('message:batch', (msgs: any[]) => {
      for (const msg of msgs) {
        addMessage(msg);
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    socket.on('message:status', ({ messageId, phone, status }) => {
      updateMessageStatus(messageId, phone, status);
    });

    socket.on('message:revoked', ({ messageId, phone }) => {
      revokeMessage(messageId, phone);
    });

    socket.on('config:changed', () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
    });

    return () => {
      socket.off('message:new');
      socket.off('message:batch');
      socket.off('message:status');
      socket.off('message:revoked');
      socket.off('config:changed');
    };
  }, [addMessage, updateMessageStatus, revokeMessage, queryClient]);
}
