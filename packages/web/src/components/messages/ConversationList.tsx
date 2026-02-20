import { useQuery } from '@tanstack/react-query';
import { fetchConversations, type Conversation } from '../../lib/api';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/cn';
import { MessageSquare } from 'lucide-react';

export default function ConversationList() {
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    refetchInterval: 10000,
  });

  const selectedPhone = useStore((s) => s.selectedPhone);
  const setSelectedPhone = useStore((s) => s.setSelectedPhone);

  return (
    <div className="w-72 border-r border-gray-200 flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
          Conversations
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && (
          <div className="p-4 text-center text-gray-400 text-sm">
            <MessageSquare className="mx-auto mb-2 opacity-50" size={32} />
            No conversations yet.<br />
            Send a message to the RCS API to start.
          </div>
        )}
        {conversations.map((c) => (
          <ConversationItem
            key={c.phone}
            conversation={c}
            selected={selectedPhone === c.phone}
            onSelect={() => setSelectedPhone(c.phone)}
          />
        ))}
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  selected,
  onSelect,
}: {
  conversation: Conversation;
  selected: boolean;
  onSelect: () => void;
}) {
  const preview = getPreviewText(conversation.lastMessage);

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-gray-100 transition-colors',
        selected ? 'bg-blue-50 border-l-2 border-l-blue-600' : 'hover:bg-gray-50',
      )}
    >
      <div className="flex justify-between items-baseline">
        <span className="font-medium text-sm truncate">{conversation.phone}</span>
        <span className="text-xs text-gray-400 ml-2 shrink-0">
          {new Date(conversation.lastCreatedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      <div className="text-xs text-gray-500 truncate mt-0.5">{preview}</div>
      <div className="text-xs text-gray-400 mt-0.5">{conversation.messageCount} messages</div>
    </button>
  );
}

function getPreviewText(payload: any): string {
  if (!payload) return '';
  if (payload.text) return payload.text.substring(0, 60);
  if (payload.richCard) return '[Rich Card]';
  if (payload.contentInfo || payload.uploadedRbmFile) return '[Media]';
  return '[Message]';
}
