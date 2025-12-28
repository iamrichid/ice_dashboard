
import React from 'react';
import { ViewType, UserSettings } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  settings: UserSettings | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, settings }) => {
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
      </div>

      {/* System Status */}
      <div className="p-4 hidden lg:block">
        <div className="bg-surface-dark rounded-lg p-4 border border-border-dark/30">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <span className="material-symbols-outlined text-[18px]">wifi</span>
            <span className="text-xs font-bold uppercase tracking-wider">System Online</span>
          </div>
          <p className="text-[#9cabba] text-xs">Latency: 12ms <br/> Server: US-East-1</p>
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
