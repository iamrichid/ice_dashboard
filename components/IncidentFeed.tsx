
import React, { useState, useMemo } from 'react';
import { Incident, IncidentPriority, IncidentStatus } from '../types';

interface FeedProps {
  incidents: Incident[];
  selectedId: string;
  onSelect: (incident: Incident) => void;
}

const IncidentFeed: React.FC<FeedProps> = ({ incidents, selectedId, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Only show Active or Pending incidents in the incoming feed
  // Completed (Resolved) and Cancelled incidents go to History
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter(incident =>
        incident.status !== IncidentStatus.RESOLVED &&
        incident.status !== IncidentStatus.CANCELLED
      )
      .filter(incident => {
        const query = searchQuery.toLowerCase();
        return (
          incident.title.toLowerCase().includes(query) ||
          incident.type.toLowerCase().includes(query) ||
          incident.location.toLowerCase().includes(query) ||
          incident.id.toLowerCase().includes(query)
        );
      });
  }, [incidents, searchQuery]);

  const handleClearFilter = () => {
    setSearchQuery('');
  };

  return (
    <section className="w-[380px] flex flex-col border-r border-border-dark/30 bg-surface-darker shrink-0">
      <div className="p-4 border-b border-border-dark/30 bg-surface-darker sticky top-0 z-10 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-white text-base font-semibold">Incoming Feed</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              {filteredIncidents.length} Live
            </span>
          </div>
        </div>

        {/* Search Bar with Clear Button */}
        <div className="relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active signals..."
            className="w-full bg-surface-dark/40 border border-border-dark/50 rounded-lg pl-9 pr-12 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={handleClearFilter}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              title="Clear Filter"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-2 flex flex-col gap-2">
        {filteredIncidents.length > 0 ? (
          filteredIncidents.map((incident) => (
            <div key={incident.id} className="incident-entry">
              <FeedItem
                incident={incident}
                isSelected={incident.id === selectedId}
                onClick={() => onSelect(incident)}
              />
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center p-8">
            <span className="material-symbols-outlined text-4xl mb-2">rss_feed</span>
            <p className="text-xs font-medium uppercase tracking-widest">No Active Signals Matching Filter</p>
          </div>
        )}
      </div>
    </section>
  );
};

interface FeedItemProps {
  incident: Incident;
  isSelected: boolean;
  onClick: () => void;
}

const FeedItem: React.FC<FeedItemProps> = ({ incident, isSelected, onClick }) => {
  const getPriorityColor = (p: IncidentPriority) => {
    switch (p) {
      case IncidentPriority.CRITICAL: return 'text-red-500';
      case IncidentPriority.HIGH: return 'text-red-400';
      case IncidentPriority.MEDIUM: return 'text-orange-400';
      default: return 'text-[#9cabba]';
    }
  };

  const getPriorityDot = (p: IncidentPriority) => {
    switch (p) {
      case IncidentPriority.CRITICAL:
      case IncidentPriority.HIGH: return 'bg-red-500';
      case IncidentPriority.MEDIUM: return 'bg-orange-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative flex gap-4 p-4 rounded-xl border transition-all cursor-pointer ${isSelected
          ? 'bg-surface-dark border-primary/50 shadow-lg shadow-primary/5'
          : 'bg-transparent border-transparent hover:bg-surface-dark/50 hover:border-border-dark/50'
        }`}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Active</span>
        <div className="size-1.5 rounded-full bg-primary animate-pulse"></div>
        </div>
      )}

      <div className="flex items-start gap-4 w-full">
        <div className={`flex items-center justify-center rounded-lg shrink-0 size-10 ${isSelected ? 'bg-primary/20 text-primary' : 'bg-[#283039] text-[#9cabba] group-hover:text-white transition-colors'}`}>
          <span className="material-symbols-outlined">{incident.icon}</span>
        </div>

        <div className="flex flex-1 flex-col justify-center pr-8 overflow-hidden">
          <div className="flex justify-between items-start">
            <p className="text-white text-sm font-semibold leading-tight truncate">{incident.title}</p>
            {!isSelected && <span className={`size-2 rounded-full mt-1.5 shrink-0 ml-2 ${getPriorityDot(incident.priority)}`}></span>}
          </div>
          <p className={`${getPriorityColor(incident.priority)} text-[11px] font-bold uppercase tracking-wide mt-1`}>
            {incident.type}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[#9cabba] text-[10px] font-medium uppercase tracking-tight">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span className="truncate">{incident.timeAgo}</span>
            <span className="mx-0.5">•</span>
            <span className="truncate">{incident.sector}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentFeed;
