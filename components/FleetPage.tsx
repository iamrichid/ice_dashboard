
import React, { useState } from 'react';
import { MOCK_FLEET } from '../constants';
import { Unit, UnitStatus } from '../types';

const FleetPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('All');

  const filteredUnits = MOCK_FLEET.filter(unit => 
    filterType === 'All' || unit.type === filterType
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark">
      <div className="px-8 py-6 border-b border-border-dark/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Fleet Management</h2>
          <p className="text-[#9cabba] text-sm">Real-time status of all active response units</p>
        </div>
        
        <div className="flex gap-2 bg-surface-darker p-1 rounded-lg border border-border-dark/50">
          {['All', 'Police', 'EMS', 'Fire'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                filterType === type 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-[#9cabba] hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUnits.map(unit => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      </div>
    </div>
  );
};

const UnitCard: React.FC<{ unit: Unit }> = ({ unit }) => {
  const statusStyles = {
    [UnitStatus.AVAILABLE]: 'bg-green-500/10 text-green-500 border-green-500/20',
    [UnitStatus.EN_ROUTE]: 'bg-primary/10 text-primary border-primary/20',
    [UnitStatus.ON_SCENE]: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    [UnitStatus.BUSY]: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    [UnitStatus.OFF_DUTY]: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  };

  const typeIcons = {
    Police: 'local_police',
    EMS: 'medical_services',
    Fire: 'local_fire_department',
  };

  return (
    <div className="bg-surface-darker border border-border-dark/30 rounded-xl p-5 hover:border-primary/30 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-lg flex items-center justify-center ${
            unit.type === 'Police' ? 'bg-blue-500/10 text-blue-500' :
            unit.type === 'EMS' ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-500'
          }`}>
            <span className="material-symbols-outlined">{typeIcons[unit.type]}</span>
          </div>
          <div>
            <h4 className="text-white font-bold">{unit.id}</h4>
            <p className="text-[#9cabba] text-xs">{unit.type} Division</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusStyles[unit.status]}`}>
          {unit.status}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          <span className="text-xs">{unit.location}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="material-symbols-outlined text-[16px]">group</span>
          <span className="text-xs">{unit.personnel.length > 0 ? unit.personnel.join(', ') : 'None'}</span>
        </div>
        {unit.assignedIncidentId && (
          <div className="mt-2 p-2 rounded bg-surface-dark/50 border border-border-dark/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-primary">link</span>
            <span className="text-[10px] text-primary font-bold">ASSIGNED: #{unit.assignedIncidentId}</span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border-dark/30 flex justify-between items-center">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Updated {unit.lastUpdated}</span>
        <button className="text-slate-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[20px]">more_horiz</span>
        </button>
      </div>
    </div>
  );
};

export default FleetPage;
