import { composeMessage } from '../../lib/api';
import { Phone, ExternalLink, MapPin, Calendar, Share2, MessageSquare } from 'lucide-react';

interface Props {
  suggestions: any[];
  phone: string;
}

export default function SuggestionChips({ suggestions, phone }: Props) {
  const handleTap = async (suggestion: any) => {
    const reply = suggestion.reply;
    const action = suggestion.action;

    if (reply) {
      await composeMessage({
        phone,
        suggestionResponse: {
          postbackData: reply.postbackData,
          text: reply.text,
        },
      });
    } else if (action) {
      // Trigger the action behavior in addition to sending postback
      if (action.openUrlAction?.url) {
        window.open(action.openUrlAction.url, '_blank');
      }
      if (action.dialAction?.phoneNumber) {
        window.open(`tel:${action.dialAction.phoneNumber}`);
      }

      await composeMessage({
        phone,
        suggestionResponse: {
          postbackData: action.postbackData,
          text: action.text,
        },
      });
    }
  };

  return (
    <div className="bg-white border-t px-3 py-2 flex flex-wrap gap-1.5">
      {suggestions.map((s, i) => {
        const label = s.reply?.text ?? s.action?.text ?? '?';
        const icon = getActionIcon(s);
        return (
          <button
            key={i}
            onClick={() => handleTap(s)}
            className="text-xs px-3 py-1.5 rounded-full border border-blue-400 text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1"
          >
            {icon}
            {label}
          </button>
        );
      })}
    </div>
  );
}

function getActionIcon(suggestion: any) {
  const action = suggestion.action;
  if (!action) return <MessageSquare size={10} />;
  if (action.dialAction) return <Phone size={10} />;
  if (action.openUrlAction) return <ExternalLink size={10} />;
  if (action.viewLocationAction) return <MapPin size={10} />;
  if (action.shareLocationAction) return <Share2 size={10} />;
  if (action.createCalendarEventAction) return <Calendar size={10} />;
  return null;
}
