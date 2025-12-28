
import React from 'react';

interface HeaderProps {
  timeString: string;
}

const Header: React.FC<HeaderProps> = ({ timeString }) => {
  return (
    <header className="h-auto min-h-[80px] w-full border-b border-border-dark/30 bg-surface-darker/50 backdrop-blur-md flex items-center px-6 py-4 shrink-0 gap-6 overflow-x-auto">
      <div className="flex flex-col min-w-[150px]">
        <h2 className="text-xl font-bold text-white tracking-tight">Central Command</h2>
        <p className="text-xs text-[#9cabba] whitespace-nowrap">{timeString}</p>
      </div>
      
      <div className="h-8 w-px bg-border-dark/50 mx-2 hidden sm:block"></div>
      
      <div className="flex gap-6">
        <StatCard 
          icon="warning" 
          color="red" 
          label="Active Incidents" 
          value="12" 
        />
        <StatCard 
          icon="directions_car" 
          color="primary" 
          label="Available Units" 
          value="5" 
        />
        <StatCard 
          icon="timer" 
          color="green" 
          label="Avg Response" 
          value="3m 42s" 
        />
      </div>

      <div className="flex-1"></div>

      <div className="relative hidden md:block">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
        <input 
          className="bg-surface-dark border border-border-dark text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-64 pl-10 p-2.5 placeholder-slate-500" 
          placeholder="Search signals, units..." 
          type="text"
        />
      </div>
    </header>
  );
};

interface StatCardProps {
  icon: string;
  color: 'red' | 'primary' | 'green';
  label: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, color, label, value }) => {
  const colorMap = {
    red: 'bg-red-500/10 text-red-500',
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-500',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${colorMap[color]}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-[#9cabba] text-xs font-medium uppercase tracking-wider whitespace-nowrap">{label}</p>
        <p className="text-white text-xl font-bold leading-none">{value}</p>
      </div>
    </div>
  );
};

export default Header;
