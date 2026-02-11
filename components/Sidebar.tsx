
import React from 'react';
import { ViewType, UserSettings } from '../types';
import { auth, signOut } from '../firebase';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  settings: UserSettings | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, settings }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <aside className="w-20 lg:w-64 bg-surface-darker flex flex-col justify-between border-r border-border-dark/30 shrink-0 z-20 transition-all duration-300">
      <div className="flex flex-col gap-6 p-4">
        {/* User Profile */}
        <div className="flex items-center gap-3 pb-6 border-b border-border-dark/30">
          <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 shrink-0 relative"
            style={{ backgroundImage: `url("${settings?.photoUrl || 'https://picsum.photos/200'}")` }}>
            <span className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-surface-darker rounded-full"></span>
          </div>
          <div className="hidden lg:flex flex-col overflow-hidden">
            <h1 className="text-white text-sm font-semibold leading-tight truncate">{settings?.displayName || 'Operator'}</h1>
            <p className="text-[#9cabba] text-xs font-normal truncate">ID: {settings?.operatorId || 'Loading...'}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <NavItem
            icon="dashboard"
            label="Dashboard"
            active={activeView === 'dashboard'}
            onClick={() => onViewChange('dashboard')}
          />
          <NavItem
            icon="history"
            label="History"
            active={activeView === 'history'}
            onClick={() => onViewChange('history')}
          />
          <NavItem
            icon="local_shipping"
            label="Fleet"
            active={activeView === 'fleet'}
            onClick={() => onViewChange('fleet')}
          />
          <NavItem
            icon="settings"
            label="Settings"
            active={activeView === 'settings'}
            onClick={() => onViewChange('settings')}
          />
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-red-500 hover:bg-red-500/10 group"
        >
          <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">logout</span>
          <span className="hidden lg:block text-sm font-medium">End Session</span>
        </button>
      </div>

      {/* System Status */}
      <div className="p-4 hidden lg:block space-y-4">
        {/* Shareable Company Details */}
        <div className="bg-surface-dark rounded-lg p-4 border border-border-dark/30">
          <h4 className="text-[#9cabba] text-[10px] font-bold uppercase tracking-widest mb-3">App Configuration</h4>

          <div className="space-y-3">
            <div>
              <p className="text-slate-500 text-[10px] font-medium mb-0.5">Company ID</p>
              <div className="flex justify-between items-center group cursor-pointer"
                onClick={() => navigator.clipboard.writeText(settings?.company || '')}
                title="Click to copy">
                <code className="text-white text-xs font-mono bg-black/20 px-1.5 py-0.5 rounded border border-white/5 group-hover:border-primary/30 transition-colors">
                  {settings?.company || 'Not Set'}
                </code>
                <span className="material-symbols-outlined text-[14px] text-slate-600 group-hover:text-primary transition-colors">content_copy</span>
              </div>
            </div>

            <div>
              <p className="text-slate-500 text-[10px] font-medium mb-0.5">Country ID</p>
              <div className="flex justify-between items-center group cursor-pointer"
                onClick={() => navigator.clipboard.writeText(settings?.countryId || '')}
                title="Click to copy">
                <code className="text-white text-xs font-mono bg-black/20 px-1.5 py-0.5 rounded border border-white/5 group-hover:border-primary/30 transition-colors">
                  {settings?.countryId || 'Not Set'}
                </code>
                <span className="material-symbols-outlined text-[14px] text-slate-600 group-hover:text-primary transition-colors">content_copy</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-dark rounded-lg p-4 border border-border-dark/30">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <span className="material-symbols-outlined text-[18px]">wifi</span>
            <span className="text-xs font-bold uppercase tracking-wider">System Online</span>
          </div>
          <p className="text-[#9cabba] text-xs">Latency: 12ms <br /> Server: US-East-1</p>
        </div>
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${active ? 'bg-primary text-white' : 'text-[#9cabba] hover:bg-surface-dark/50 hover:text-white'}`}
  >
    <span className="material-symbols-outlined text-[24px]">{icon}</span>
    <span className="hidden lg:block text-sm font-medium">{label}</span>
  </button>
);

export default Sidebar;
