import { useQuery } from '@tanstack/react-query';
import { fetchMessage } from '../../lib/api';
import { useStore } from '../../store/useStore';
import { Check, CheckCheck, X, Clock } from 'lucide-react';

export default function MessageDetail() {
  const selectedId = useStore((s) => s.selectedMessageId);

  const { data: message } = useQuery({
    queryKey: ['message', selectedId],
    queryFn: () => fetchMessage(selectedId!),
    enabled: !!selectedId,
  });

  if (!selectedId || !message) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        Click a message to view details
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
        Message Detail
      </h3>

      {/* Timeline */}
      <div className="space-y-2">
        <TimelineEntry
          icon={<Clock size={14} />}
          label="Sent"
          time={message.createdAt}
          active
        />
        <TimelineEntry
          icon={<Check size={14} />}
          label="Delivered"
          time={message.deliveredAt}
          active={!!message.deliveredAt}
        />
        <TimelineEntry
          icon={<CheckCheck size={14} />}
          label="Read"
          time={message.readAt}
          active={!!message.readAt}
        />
        {message.revokedAt && (
          <TimelineEntry
            icon={<X size={14} />}
            label="Revoked"
            time={message.revokedAt}
            active
          />
        )}
      </div>

      {/* Metadata */}
      <div className="text-xs space-y-1">
        <div><span className="text-gray-500">ID:</span> {message.messageId}</div>
        <div><span className="text-gray-500">Direction:</span> {message.direction}</div>
        <div><span className="text-gray-500">Status:</span> {message.status}</div>
        <div><span className="text-gray-500">Phone:</span> {message.phone}</div>
      </div>

      {/* Raw JSON */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Raw Payload</h4>
        <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-[11px] overflow-auto max-h-64 leading-relaxed">
          {JSON.stringify(message.payload, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function TimelineEntry({
  icon,
  label,
  time,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  time: string | null;
  active: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 text-xs ${active ? 'text-gray-700' : 'text-gray-300'}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
      }`}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
      {time && (
        <span className="text-gray-400 ml-auto">
          {new Date(time).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
