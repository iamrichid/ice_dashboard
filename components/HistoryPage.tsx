
import React, { useState, useMemo } from 'react';
import { IncidentPriority, IncidentStatus, Incident } from '../types';

interface HistoryPageProps {
  incidents: Incident[];
  loading: boolean;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ incidents, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('All');

  const filteredHistory = useMemo(() => {
    return incidents
      .filter(incident => {
        // ONLY show RESOLVED or CANCELLED in history
        const isHistoryStatus =
          incident.status === IncidentStatus.RESOLVED ||
          incident.status === IncidentStatus.CANCELLED;

        if (!isHistoryStatus) return false;

        const matchesSearch =
          incident.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPriority = filterPriority === 'All' || incident.priority === filterPriority;
        return matchesSearch && matchesPriority;
      })
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [incidents, searchTerm, filterPriority]);

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark">
      {/* Search & Filter Header */}
      <div className="px-8 py-6 border-b border-border-dark/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Incident History</h2>
          <p className="text-[#9cabba] text-sm">Review resolved and archived signals from the central database</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined text-[20px]">search</span>
            <input
              className="bg-surface-darker border border-border-dark text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-64 pl-10 p-2.5 placeholder-slate-500"
              placeholder="Filter by ID, Type, Location..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="bg-surface-darker border border-border-dark text-white text-sm rounded-lg focus:ring-primary focus:border-primary p-2.5"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value={IncidentPriority.LOW}>Low</option>
            <option value={IncidentPriority.MEDIUM}>Medium</option>
            <option value={IncidentPriority.HIGH}>High</option>
            <option value={IncidentPriority.CRITICAL}>Critical</option>
          </select>

          <button className="flex items-center gap-2 bg-surface-darker hover:bg-surface-dark border border-border-dark text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            Date Range
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="flex-1 overflow-x-auto p-8">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden border border-border-dark/30 rounded-xl bg-surface-darker/30">
            <table className="min-w-full divide-y divide-border-dark/30">
              <thead className="bg-surface-darker">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#9cabba] uppercase tracking-wider">Signal ID</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#9cabba] uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#9cabba] uppercase tracking-wider">Date/Time</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#9cabba] uppercase tracking-wider">Priority</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#9cabba] uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#9cabba] uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-[#9cabba] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark/20 bg-surface-darker/10">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#9cabba]">Accessing Secure Records...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredHistory.map((incident) => (
                  <tr key={incident.id} className="hover:bg-surface-dark/20 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="size-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 mr-3">
                          <span className="material-symbols-outlined text-[18px]">{incident.icon || 'emergency'}</span>
                        </div>
                        <span className="text-sm font-bold text-white">#{incident.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-300 font-medium">{incident.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-white">{incident.date || 'Syncing...'}</span>
                        <span className="text-xs text-slate-500">{incident.timeAgo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={incident.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-slate-400">
                        <span className="material-symbols-outlined text-[14px] mr-1.5">location_on</span>
                        <span className="text-sm max-w-[200px] truncate">{incident.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={incident.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-[#9cabba] hover:text-white transition-colors mr-4">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button className="text-[#9cabba] hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">inventory_2</span>
                        <p className="text-slate-500 font-medium">No archived signals found matching your parameters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const PriorityBadge: React.FC<{ priority: IncidentPriority }> = ({ priority }) => {
  const styles = {
    [IncidentPriority.CRITICAL]: 'bg-red-500/10 text-red-500 border-red-500/20',
    [IncidentPriority.HIGH]: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    [IncidentPriority.MEDIUM]: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    [IncidentPriority.LOW]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[priority] || styles[IncidentPriority.LOW]}`}>
      {priority}
    </span>
  );
};

const StatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  const styles = {
    [IncidentStatus.RESOLVED]: 'bg-green-500/10 text-green-500',
    [IncidentStatus.CANCELLED]: 'bg-slate-500/10 text-slate-500',
    [IncidentStatus.ACTIVE]: 'bg-primary/10 text-primary',
    [IncidentStatus.PENDING]: 'bg-yellow-500/10 text-yellow-500',
  };

  const currentStyle = styles[status] || styles[IncidentStatus.PENDING];

  return (
    <div className="flex items-center gap-2">
      <div className={`size-1.5 rounded-full ${currentStyle.split(' ')[1].replace('text-', 'bg-')}`}></div>
      <span className={`text-xs font-semibold ${currentStyle.split(' ')[1]}`}>
        {status}
      </span>
    </div>
  );
};

export default HistoryPage;
