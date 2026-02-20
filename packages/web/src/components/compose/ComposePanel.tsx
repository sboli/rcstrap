import { useState } from 'react';
import { composeMessage } from '../../lib/api';
import { Send, MapPin, Paperclip } from 'lucide-react';

interface Props {
  phone: string;
}

export default function ComposePanel({ phone }: Props) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'text' | 'location' | 'file'>('text');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [sending, setSending] = useState(false);

  const sendText = async () => {
    if (!text.trim()) return;
    setSending(true);
    await composeMessage({ phone, text: text.trim() });
    setText('');
    setSending(false);
  };

  const sendLocation = async () => {
    if (!lat || !lng) return;
    setSending(true);
    await composeMessage({
      phone,
      location: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
    });
    setLat('');
    setLng('');
    setSending(false);
  };

  return (
    <div className="p-4">
      <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide mb-3">
        Compose MO Message
      </h3>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-3">
        <TabButton active={mode === 'text'} onClick={() => setMode('text')}>
          Text
        </TabButton>
        <TabButton active={mode === 'location'} onClick={() => setMode('location')}>
          <MapPin size={14} />
        </TabButton>
        <TabButton active={mode === 'file'} onClick={() => setMode('file')}>
          <Paperclip size={14} />
        </TabButton>
      </div>

      {mode === 'text' && (
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a user message..."
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendText}
            disabled={!text.trim() || sending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={14} /> Send
          </button>
        </div>
      )}

      {mode === 'location' && (
        <div className="space-y-2">
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="Longitude"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendLocation}
            disabled={!lat || !lng || sending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <MapPin size={14} /> Send Location
          </button>
        </div>
      )}

      {mode === 'file' && (
        <div className="text-xs text-gray-400 py-4 text-center">
          File upload from compose panel — coming soon
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
        active ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}
