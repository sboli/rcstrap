import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Settings } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen">
      {/* Sidebar nav */}
      <nav className="w-14 bg-gray-900 flex flex-col items-center py-4 gap-4">
        <div className="text-white font-bold text-xs tracking-wider mb-4">RC</div>
        <NavItem
          to="/"
          icon={<MessageSquare size={20} />}
          active={location.pathname === '/' || location.pathname.startsWith('/conversations')}
        />
        <NavItem
          to="/settings"
          icon={<Settings size={20} />}
          active={location.pathname === '/settings'}
        />
      </nav>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">{children}</div>
    </div>
  );
}

function NavItem({ to, icon, active }: { to: string; icon: React.ReactNode; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
        active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800',
      )}
    >
      {icon}
    </Link>
  );
}
