import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import ConversationList from '../components/messages/ConversationList';
import PhoneFrame from '../components/phone-preview/PhoneFrame';
import ComposePanel from '../components/compose/ComposePanel';
import MessageDetail from '../components/messages/MessageDetail';

export default function ConversationPage() {
  const { phone: routePhone } = useParams();
  const selectedPhone = useStore((s) => s.selectedPhone);
  const setSelectedPhone = useStore((s) => s.setSelectedPhone);
  const selectedMessageId = useStore((s) => s.selectedMessageId);

  useEffect(() => {
    if (routePhone) setSelectedPhone(routePhone);
  }, [routePhone, setSelectedPhone]);

  const phone = selectedPhone;

  return (
    <>
      {/* Left — conversation list */}
      <ConversationList />

      {/* Center — phone preview */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-4">
        {phone ? (
          <div className="w-[380px] h-[680px] bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
            <PhoneFrame phone={phone} />
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <p className="text-lg font-medium">RCStrap</p>
            <p className="text-sm mt-1">Select a conversation or send a message to the RCS API</p>
          </div>
        )}
      </div>

      {/* Right — context panel */}
      <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
        {phone && !selectedMessageId && <ComposePanel phone={phone} />}
        {selectedMessageId && <MessageDetail />}
        {!phone && (
          <div className="p-4 text-center text-gray-400 text-sm">
            Select a conversation to compose messages
          </div>
        )}
      </div>
    </>
  );
}
