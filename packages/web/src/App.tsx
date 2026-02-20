import { Routes, Route } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import AppShell from './components/layout/AppShell';
import ConversationPage from './pages/ConversationPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  useSocket();

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<ConversationPage />} />
        <Route path="/conversations/:phone" element={<ConversationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  );
}
