import type { Message } from '../../lib/api';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/cn';
import { Check, CheckCheck, X, Shield, CreditCard, Megaphone, Clock, MapPin, Info } from 'lucide-react';
import RichCardPreview from './RichCardPreview';
import MediaPreview from './MediaPreview';

const TRAFFIC_TYPE_BADGE: Record<string, { label: string; color: string; icon: any }> = {
  AUTHENTICATION: { label: 'Auth', color: 'bg-amber-100 text-amber-700', icon: Shield },
  TRANSACTION: { label: 'Transaction', color: 'bg-green-100 text-green-700', icon: CreditCard },
  PROMOTION: { label: 'Promo', color: 'bg-purple-100 text-purple-700', icon: Megaphone },
  SERVICEREQUEST: { label: 'Service', color: 'bg-blue-100 text-blue-700', icon: null },
  ACKNOWLEDGEMENT: { label: 'Ack', color: 'bg-gray-100 text-gray-600', icon: null },
};

export default function MessageBubble({ message, phone }: { message: Message; phone: string }) {
  const setSelectedMessageId = useStore((s) => s.setSelectedMessageId);
  const isMT = message.direction === 'MT';
  const payload = message.payload;
  const isRevoked = message.status === 'REVOKED';
  const trafficType = payload.trafficType as string | undefined;
  const badge = trafficType ? TRAFFIC_TYPE_BADGE[trafficType] : null;

  const handleBubbleClick = (e: React.MouseEvent) => {
    // Don't select message detail if user clicked an interactive element inside
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    setSelectedMessageId(message.id);
  };

  return (
    <div className={cn('flex', isMT ? 'justify-start' : 'justify-end')}>
      <div
        onClick={handleBubbleClick}
        className={cn(
          'max-w-[85%] rounded-2xl px-3 py-2 cursor-pointer transition-shadow hover:shadow-md group relative',
          isMT ? 'bg-white text-gray-900 shadow-sm' : 'bg-blue-600 text-white',
          isRevoked && 'opacity-40',
        )}
      >
        {/* Detail button */}
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedMessageId(message.id); }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full bg-black/10 flex items-center justify-center"
          title="View details"
        >
          <Info size={10} />
        </button>

        {/* Revoked overlay */}
        {isRevoked && (
          <div className="flex items-center gap-1 text-red-500 text-xs mb-1">
            <X size={12} />
            <span className="italic">Message revoked</span>
          </div>
        )}

        {/* Traffic type badge */}
        {badge && (
          <div className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded mb-1', badge.color)}>
            {badge.icon && <badge.icon size={10} />}
            {badge.label}
          </div>
        )}

        {/* Text content */}
        {payload.text && <p className={cn('text-sm whitespace-pre-wrap', isRevoked && 'line-through')}>{payload.text}</p>}

        {/* Rich card */}
        {payload.richCard && !isRevoked && <RichCardPreview richCard={payload.richCard} phone={phone} />}

        {/* Media */}
        {payload.contentInfo && !isRevoked && (
          <MediaPreview media={payload.contentInfo} />
        )}
        {payload.uploadedRbmFile && !payload.contentInfo && (
          <div className="bg-gray-200 rounded-lg p-3 text-center text-xs text-gray-500">
            File: {payload.uploadedRbmFile}
          </div>
        )}

        {/* Location (MO) */}
        {payload.location && (
          <a
            href={`https://maps.google.com/?q=${payload.location.latitude},${payload.location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="block bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200 transition-colors"
          >
            <MapPin size={16} className="text-red-500 shrink-0" />
            <div className="text-xs text-gray-600">
              <div className="font-medium">Shared Location</div>
              <div>{payload.location.latitude}, {payload.location.longitude}</div>
            </div>
          </a>
        )}

        {/* Suggestion tap (MO) */}
        {payload.suggestionResponse && (
          <div className="bg-blue-500/20 rounded-lg px-2 py-1 text-xs">
            Tapped: <span className="font-medium">{payload.suggestionResponse.text}</span>
          </div>
        )}

        {/* TTL / expireTime indicator */}
        {(payload.ttl || payload.expireTime) && (
          <div className="flex items-center gap-1 text-[10px] text-orange-500 mt-1">
            <Clock size={10} />
            {payload.ttl && <span>TTL: {payload.ttl}</span>}
            {payload.expireTime && <span>Expires: {new Date(payload.expireTime).toLocaleString()}</span>}
          </div>
        )}

        {/* Status + time */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isMT ? 'text-gray-400' : 'text-blue-200',
          )}
        >
          <span className="text-[10px]">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isMT && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'DELIVERED':
      return <Check size={12} />;
    case 'READ':
      return <CheckCheck size={12} className="text-blue-500" />;
    case 'REVOKED':
      return <X size={12} className="text-red-400" />;
    default:
      return <Check size={12} className="opacity-50" />;
  }
}
