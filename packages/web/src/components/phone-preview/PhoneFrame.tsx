import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMessages, composeMessage } from '../../lib/api';
import { useStore } from '../../store/useStore';
import { getSocket } from '../../lib/socket';
import { Send } from 'lucide-react';
import MessageBubble from './MessageBubble';
import SuggestionChips from './SuggestionChips';
import TypingIndicator from './TypingIndicator';

export default function PhoneFrame({ phone }: { phone: string }) {
  const { data: serverMessages } = useQuery({
    queryKey: ['messages', phone],
    queryFn: () => fetchMessages(phone),
    enabled: !!phone,
  });

  const storeMessages = useStore((s) => s.messages[phone]);
  const setMessages = useStore((s) => s.setMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (serverMessages) setMessages(phone, serverMessages);
  }, [serverMessages, phone, setMessages]);

  // Listen for agent typing events
  useEffect(() => {
    const socket = getSocket();
    const handleEvent = (data: any) => {
      if (data.phone === phone && data.eventType === 'IS_TYPING') {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };
    socket.on('agent:event', handleEvent);
    return () => { socket.off('agent:event', handleEvent); };
  }, [phone]);

  // Auto-scroll to bottom on new messages
  const messages = storeMessages ?? serverMessages ?? [];
  const sorted = [...messages].reverse();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sorted.length]);

  const lastMtMessage = sorted.filter((m) => m.direction === 'MT' && m.status !== 'REVOKED').at(-1);
  const suggestions = lastMtMessage?.payload?.suggestions;

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText('');
    await composeMessage({ phone, text: trimmed });
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Phone header */}
      <div className="bg-gray-900 text-white px-4 py-3 rounded-t-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
          RCS
        </div>
        <div>
          <div className="text-sm font-medium">{phone}</div>
          <div className="text-xs text-gray-400">
            {isTyping ? 'typing...' : 'RCS Business Messaging'}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gray-100 px-3 py-4 space-y-2">
        {sorted.map((msg) => (
          <MessageBubble key={msg.id} message={msg} phone={phone} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Suggestion chips */}
      {suggestions && suggestions.length > 0 && (
        <SuggestionChips suggestions={suggestions} phone={phone} />
      )}

      {/* Input bar */}
      <div className="bg-white border-t px-3 py-2 rounded-b-2xl flex items-center gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-30 hover:bg-blue-700 transition-colors shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
