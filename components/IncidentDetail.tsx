
import React, { useState, useEffect } from 'react';
import { Incident, LogMessage, IncidentPriority, IncidentStatus } from '../types';
import { db, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from '../firebase';

interface DetailProps {
  incident: Incident | null;
}

const IncidentDetail: React.FC<DetailProps> = ({ incident }) => {
  const [messages, setMessages] = useState<LogMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Real-time Firestore Listener for Logs
  useEffect(() => {
    if (!incident) return;

    setLoading(true);
    const q = query(
      collection(db, "incidents", incident.id, "logs"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const data = snapshot.docs.map((doc: any) => {
        const item = doc.data();
        return {
          id: doc.id,
          ...item,
          timestamp: item.timestamp ? new Date(item.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : 'Syncing...'
        };
      }) as LogMessage[];

      setMessages(data);
      setLoading(false);
    }, (error: any) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [incident?.id]);

  if (!incident) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-background-dark/30 animate-pulse">
        <div className="flex flex-col items-center opacity-30 text-center px-8">
          <div className="size-24 rounded-full bg-slate-800 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-6xl">terminal</span>
          </div>
          <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-3 text-white">No Active Signal Selected</h2>
          <p className="text-xs font-medium max-w-xs text-[#9cabba] leading-relaxed">
            Select an incoming transmission from the feed to begin tactical oversight, dispatch units, or escalate priority.
          </p>
        </div>
      </div>
    );
  }

  const addLog = async (sender: 'System' | 'Operator' | 'User' | 'AI', content: string) => {
    try {
      await addDoc(collection(db, "incidents", incident.id, "logs"), {
        sender,
        content,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Failed to add log", e);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const messageContent = input;
    setInput('');
    await addLog('Operator', messageContent);
  };

  const handleDispatch = async (unitType: string) => {
    setActionLoading(unitType);
    try {
      await addLog('System', `Dispatching ${unitType} units to ${incident.location}...`);
      await updateDoc(doc(db, "incidents", incident.id), { status: IncidentStatus.PENDING });
    } catch (e) {
      console.error("Dispatch failed", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEscalate = async () => {
    setActionLoading('escalate');
    try {
      let nextPriority = incident.priority;
      if (incident.priority === IncidentPriority.LOW) nextPriority = IncidentPriority.MEDIUM;
      else if (incident.priority === IncidentPriority.MEDIUM) nextPriority = IncidentPriority.HIGH;
      else if (incident.priority === IncidentPriority.HIGH) nextPriority = IncidentPriority.CRITICAL;

      if (nextPriority !== incident.priority) {
        await updateDoc(doc(db, "incidents", incident.id), { priority: nextPriority });
        await addLog('System', `ALERT: Incident priority escalated to ${nextPriority}.`);
      }
    } catch (e) {
      console.error("Escalation failed", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async () => {
    if (!confirm("Confirm resolution: This will archive the signal and notify all responding units.")) return;
    setActionLoading('resolve');
    try {
      await updateDoc(doc(db, "incidents", incident.id), {
        status: IncidentStatus.RESOLVED,
        date: new Date().toISOString().split('T')[0]
      });
      await addLog('Operator', "Signal marked as RESOLVED. All units standing down.");
    } catch (e) {
      console.error("Resolution failed", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFalseAlarm = async () => {
    if (!confirm("Are you sure you want to mark this as a False Alarm?")) return;
    setActionLoading('false_alarm');
    try {
      await updateDoc(doc(db, "incidents", incident.id), { status: IncidentStatus.CANCELLED });
      await addLog('Operator', "Signal marked as FALSE ALARM. Closing dispatch request.");
    } catch (e) {
      console.error("Status update failed", e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-full animate-slide-in-right">
      {/* Header Info */}
      <div className="px-6 py-4 flex justify-between items-end border-b border-border-dark/30 bg-surface-darker/30">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">{incident.title}</h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${incident.priority === IncidentPriority.CRITICAL ? 'bg-red-500 text-white' :
                incident.priority === IncidentPriority.HIGH ? 'bg-red-500/20 text-red-400' :
                  'bg-orange-500/20 text-orange-400'
              }`}>
              {incident.priority}
            </span>
            <span className="text-[10px] font-medium text-slate-500 border border-border-dark px-2 py-0.5 rounded uppercase tracking-wider">
              {incident.status}
            </span>
          </div>
          <p className="text-[#9cabba] text-sm font-medium">Location: {incident.location}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleResolve}
            disabled={!!actionLoading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl transition-all text-xs font-bold shadow-lg shadow-green-600/20"
          >
            {actionLoading === 'resolve' ? (
              <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            )}
            Resolve Signal
          </button>

          <button
            onClick={handleEscalate}
            disabled={actionLoading === 'escalate' || incident.priority === IncidentPriority.CRITICAL}
            className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-red-500 px-4 py-2.5 rounded-xl transition-all text-xs font-bold"
          >
            {actionLoading === 'escalate' ? (
              <div className="size-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-[18px]">e911_emergency</span>
            )}
            {incident.priority === IncidentPriority.CRITICAL ? 'Max Priority' : 'Escalate'}
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 grid grid-cols-12 gap-6 auto-rows-min">
        {/* Map View */}
        <div className="col-span-12 lg:col-span-8 h-[450px] bg-surface-dark rounded-2xl overflow-hidden relative group border border-border-dark/50 shadow-inner ring-1 ring-white/5">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB90w9WMMBMjOOLvitf6a0ySt9ZliiXQ65g5Zu2i0QAmypUZha_nDuhDYn0sqywW2wr3QVweoK33NNHVkDsNa2dGXNEGP8Miek2ldhUxTtTW6o7YrnFM_7w028BeBxF8Vl0DlnpMJi-RPZEvpEDp0ngwXnhdyZuKgO1_9v9eH5v1G9YVIJXVeYBWl6caUAbjGM8zFiLY1SE1PngV513fEfO-wJ6ese5qRT9_b7f3HwYdEtR5wxNYj8Q9IkqyzSq2D-YmZ3r6HYVxHE")',
              filter: 'grayscale(60%) brightness(50%) contrast(120%) hue-rotate(180deg)'
            }}>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative flex items-center justify-center size-12">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-40"></span>
              <div className="bg-red-500 text-white rounded-full p-2.5 shadow-2xl border-2 border-surface-darker">
                <span className="material-symbols-outlined text-[24px]">{incident.icon}</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 bg-surface-darker/95 backdrop-blur border-l-4 border-primary p-3 rounded-r-lg flex items-center gap-3 shadow-2xl z-10">
            <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              <span className="material-symbols-outlined">ambulance</span>
            </div>
            <div>
              <p className="text-white text-xs font-bold uppercase tracking-wider">Unit 412</p>
              <p className="text-primary-300 text-[10px] font-medium mt-0.5">En Route • 4 mins</p>
            </div>
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="col-span-12 lg:col-span-4 h-[450px] flex flex-col gap-4">
          <div className="bg-surface-dark rounded-2xl p-5 border border-border-dark/50 flex-1 flex flex-col overflow-y-auto shadow-xl">
            <h3 className="text-[#9cabba] text-[10px] font-bold uppercase tracking-widest mb-4">Subject Profile</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="size-16 rounded-2xl bg-cover bg-center border-2 border-white/10 shadow-lg"
                style={{ backgroundImage: `url(${incident.subject.photo})` }}>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{incident.subject.name}</h4>
                <p className="text-slate-400 text-xs font-medium">{incident.subject.gender}, {incident.subject.age} Years</p>
              </div>
            </div>
            <div className="space-y-4">
              <InfoRow label="Phone" value={incident.subject.phone} />
              <InfoRow label="Blood Type" value={incident.subject.bloodType} />
              <InfoRow label="Conditions" value={incident.subject.conditions.join(', ') || 'None Listed'} />
              <InfoRow label="Languages" value={incident.subject.languages.join(', ')} />
            </div>
          </div>
        </div>

        {/* Dispatch & Logs Row */}
        <div className="col-span-12 lg:col-span-8 bg-surface-dark rounded-2xl p-6 border border-border-dark/50 shadow-xl">
          <h3 className="text-[#9cabba] text-[10px] font-bold uppercase tracking-widest mb-6">Tactical Dispatch</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DispatchButton icon="local_police" label="Police" sub="Patrol 22" color="blue" onClick={() => handleDispatch('Police')} loading={actionLoading === 'Police'} />
            <DispatchButton icon="medical_services" label="Medical" sub="Unit 412" color="primary" onClick={() => handleDispatch('Medical')} loading={actionLoading === 'Medical'} />
            <DispatchButton icon="local_fire_department" label="Fire" sub="Engine 4" color="orange" onClick={() => handleDispatch('Fire')} loading={actionLoading === 'Fire'} />
          </div>
          <div className="mt-6">
            <button onClick={handleFalseAlarm} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Mark as False Alarm</button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-surface-dark rounded-2xl border border-border-dark/50 flex flex-col h-full min-h-[350px] shadow-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-surface-darker/50">
            <h3 className="text-[#9cabba] text-[10px] font-bold uppercase tracking-widest">Signal Logs</h3>
            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-bold uppercase tracking-tighter flex items-center gap-1">
              <span className="size-1 bg-green-500 rounded-full animate-pulse"></span>
              Secure
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {loading ? (
              <div className="flex flex-col gap-4 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-800 rounded-lg w-full"></div>)}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center">
                <span className="material-symbols-outlined text-4xl mb-2">history_edu</span>
                <p className="text-[10px] font-bold uppercase tracking-widest">No Log Data</p>
              </div>
            ) : (
              messages.map((msg) => <LogMessageItem key={msg.id} message={msg} />)
            )}
          </div>
          <div className="p-3 bg-surface-darker border-t border-white/5">
            <div className="relative">
              <input
                className="w-full bg-surface-dark text-white text-sm rounded-xl border-border-dark focus:ring-primary focus:border-primary pl-4 pr-10 py-2.5 transition-all"
                placeholder="Type transmission..."
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</span>
    <span className="text-white text-sm font-semibold">{value}</span>
  </div>
);

const DispatchButton: React.FC<{ icon: string; label: string; sub: string; color: string; onClick?: () => void; loading?: boolean }> = ({ icon, label, sub, color, onClick, loading }) => {
  const iconColors = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    primary: "bg-primary/10 text-primary border-primary/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20"
  };

  return (
    <button onClick={onClick} disabled={loading} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-darker border border-border-dark hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-50 group">
      <div className={`size-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 border ${iconColors[color as keyof typeof iconColors]}`}>
        {loading ? <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-[28px]">{icon}</span>}
      </div>
      <div className="text-left">
        <span className="block text-white text-sm font-bold tracking-tight">{label}</span>
        <span className="text-[10px] text-slate-500 font-medium uppercase">{sub}</span>
      </div>
    </button>
  );
};

const LogMessageItem: React.FC<{ message: LogMessage }> = ({ message }) => {
  const senderStyles = {
    System: 'text-slate-500 border-slate-700 bg-slate-800/20',
    Operator: 'text-primary border-primary/20 bg-primary/5',
    User: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
    AI: 'text-green-400 border-green-500/20 bg-green-500/5'
  };

  return (
    <div className={`p-3 rounded-xl border ${senderStyles[message.sender] || senderStyles.System}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest">{message.sender}</span>
        <span className="text-[9px] opacity-60 font-mono">{message.timestamp}</span>
      </div>
      <p className="text-xs font-medium leading-relaxed text-slate-200">{message.content}</p>
    </div>
  );
};

export default IncidentDetail;