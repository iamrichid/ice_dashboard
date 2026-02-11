import React, { useState, useEffect } from 'react';
import { Unit, UnitStatus } from '../types';
import { db, collection, query, where, onSnapshot, addDoc, serverTimestamp } from '../firebase';

const FleetPage: React.FC<{ companyId?: string }> = ({ companyId }) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [units, setUnits] = useState<Unit[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newUnitId, setNewUnitId] = useState('');
  const [newUnitType, setNewUnitType] = useState('Police');
  const [newUnitPersonnel, setNewUnitPersonnel] = useState('');

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, "fleets"), where("companyId", "==", companyId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUnits = snapshot.docs.map(doc => ({
        id: doc.data().unitId, // using unitId field for display ID
        ...doc.data()
      })) as Unit[];
      setUnits(fetchedUnits);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [companyId]);

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    try {
      await addDoc(collection(db, "fleets"), {
        unitId: newUnitId,
        type: newUnitType,
        status: UnitStatus.AVAILABLE,
        location: 'HQ',
        personnel: newUnitPersonnel.split(',').map(p => p.trim()),
        lastUpdated: 'Just now',
        companyId: companyId,
        timestamp: serverTimestamp()
      });
      setShowAddModal(false);
      setNewUnitId('');
      setNewUnitPersonnel('');
    } catch (error) {
      console.error("Error adding unit:", error);
    }
  };

  const filteredUnits = units.filter(unit =>
    filterType === 'All' || unit.type === filterType
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark">
      <div className="px-8 py-6 border-b border-border-dark/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Fleet Management</h2>
          <p className="text-[#9cabba] text-sm">Real-time status of all active response units</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2 bg-surface-darker p-1 rounded-lg border border-border-dark/50">
            {['All', 'Police', 'EMS', 'Fire'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterType === type
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-[#9cabba] hover:text-white'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Register Unit
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">local_shipping</span>
            <p>No units registered for this company.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUnits.map((unit, index) => (
              <UnitCard key={index} unit={unit} />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-darker border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Register New Link</h3>
            <form onSubmit={handleAddUnit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Unit ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ALPHA-1"
                  value={newUnitId}
                  onChange={e => setNewUnitId(e.target.value)}
                  className="w-full bg-surface-dark border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Division Type</label>
                <select
                  value={newUnitType}
                  onChange={e => setNewUnitType(e.target.value)}
                  className="w-full bg-surface-dark border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary transition-colors"
                >
                  <option value="Police">Police</option>
                  <option value="EMS">EMS</option>
                  <option value="Fire">Fire</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Personnel (Comma Separated)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Officer K, Officer J"
                  value={newUnitPersonnel}
                  onChange={e => setNewUnitPersonnel(e.target.value)}
                  className="w-full bg-surface-dark border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-surface-dark hover:bg-white/5 text-slate-300 font-bold py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Register Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
          <div className={`size-10 rounded-lg flex items-center justify-center ${unit.type === 'Police' ? 'bg-blue-500/10 text-blue-500' :
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
