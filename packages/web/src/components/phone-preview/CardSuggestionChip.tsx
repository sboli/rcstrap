import { useState } from 'react';
import { composeMessage } from '../../lib/api';
import { Phone, ExternalLink, MapPin, Calendar, Share2, MessageSquare, Loader2 } from 'lucide-react';

interface Props {
  suggestion: any;
  phone: string;
  size?: 'sm' | 'md';
}

export default function CardSuggestionChip({ suggestion, phone, size = 'md' }: Props) {
  const [tapping, setTapping] = useState(false);
  const reply = suggestion.reply;
  const action = suggestion.action;
  const label = reply?.text ?? action?.text ?? '?';
  const icon = getIcon(suggestion);

  const handleTap = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent bubble click from selecting message detail
    if (tapping) return;
    setTapping(true);

    // Trigger action side-effects
    if (action) {
      if (action.openUrlAction?.url) {
        window.open(action.openUrlAction.url, '_blank');
      }
      if (action.dialAction?.phoneNumber) {
        window.open(`tel:${action.dialAction.phoneNumber}`);
      }
      if (action.viewLocationAction) {
        const ll = action.viewLocationAction.latLong;
        if (ll) {
          window.open(`https://maps.google.com/?q=${ll.latitude},${ll.longitude}`, '_blank');
        }
      }
      if (action.createCalendarEventAction) {
        const cal = action.createCalendarEventAction;
        const start = cal.startTime?.replace(/[-:]/g, '').replace('.000', '');
        const end = cal.endTime?.replace(/[-:]/g, '').replace('.000', '');
        window.open(
          `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(cal.title)}&dates=${start}/${end}&details=${encodeURIComponent(cal.description ?? '')}`,
          '_blank',
        );
      }
      if (action.shareLocationAction) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              await composeMessage({
                phone,
                location: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
              });
            },
            () => {
              // fallback: send a dummy location
              composeMessage({
                phone,
                location: { latitude: 0, longitude: 0 },
              });
            },
          );
        }
      }
    }

    // Send postback to webhook
    const postbackData = reply?.postbackData ?? action?.postbackData;
    if (postbackData) {
      await composeMessage({
        phone,
        suggestionResponse: { postbackData, text: label },
      });
    }

    setTapping(false);
  };

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-1';

  return (
    <button
      onClick={handleTap}
      disabled={tapping}
      className={`${sizeClasses} rounded-full border border-blue-400 text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center gap-0.5 disabled:opacity-50 cursor-pointer`}
    >
      {tapping ? <Loader2 size={size === 'sm' ? 8 : 10} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}

function getIcon(suggestion: any) {
  const action = suggestion.action;
  if (!action) return <MessageSquare size={10} />;
  if (action.dialAction) return <Phone size={10} />;
  if (action.openUrlAction) return <ExternalLink size={10} />;
  if (action.viewLocationAction) return <MapPin size={10} />;
  if (action.shareLocationAction) return <Share2 size={10} />;
  if (action.createCalendarEventAction) return <Calendar size={10} />;
  return null;
}
