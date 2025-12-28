
import React, { useState, useEffect } from 'react';
import { UserSettings } from '../types';
import { db, doc, setDoc } from '../firebase';

interface SettingsPageProps {
  user: any;
  currentSettings: UserSettings | null;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, currentSettings }) => {
  const [formData, setFormData] = useState<UserSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (currentSettings) {
      setFormData(currentSettings);
    }
  }, [currentSettings]);

  if (!formData) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const handleToggle = (key: keyof UserSettings) => {
    setFormData(prev => prev ? { ...prev, [key]: !prev[key] } : null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSave = async () => {
    if (!user || !formData) return;
    setSaving(true);
    setSaveStatus('idle');
    try {
      await setDoc(doc(db, "operatorSettings", user.uid), formData);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error("Failed to save settings", e);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark overflow-y-auto">
      <div className="px-8 py-6 border-b border-border-dark/30 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">System Settings</h2>
          <p className="text-[#9cabba] text-sm">Configure console behavior and operator preferences</p>
        </div>
        {saveStatus === 'success' && (
          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20 animate-fade-in">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="text-sm font-bold uppercase tracking-wider">Sync Successful</span>
          </div>
        )}
      </div>

      <div className="p-8 max-w-4xl space-y-8">
        {/* Profile Section */}
        <section>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Operator Profile
          </h3>
          <div className="bg-surface-darker border border-border-dark/30 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#9cabba] uppercase tracking-wider mb-2">Display Name</label>
              <input 
                type="text" 
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full bg-surface-dark border border-border-dark rounded-lg text-white text-sm px-4 py-2 focus:ring-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#9cabba] uppercase tracking-wider mb-2">Operator ID</label>
              <input 
                type="text" 
                name="operatorId"
                value={formData.operatorId}
                onChange={handleChange}
                className="w-full bg-surface-dark border border-border-dark rounded-lg text-white text-sm px-4 py-2 focus:ring-primary focus:border-primary" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#9cabba] uppercase tracking-wider mb-2">Email Notifications</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-surface-dark border border-border-dark rounded-lg text-white text-sm px-4 py-2 focus:ring-primary focus:border-primary" 
              />
            </div>
          </div>
        </section>

        {/* Console Preferences */}
        <section>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">settings_suggest</span>
            Console Preferences
          </h3>
          <div className="bg-surface-darker border border-border-dark/30 rounded-xl divide-y divide-border-dark/30">
            <SettingToggle 
              title="Real-time Feed" 
              desc="Automatically update incident lists as new signals arrive." 
              isOn={formData.realTimeFeed} 
              onToggle={() => handleToggle('realTimeFeed')}
            />
            <SettingToggle 
              title="Audio Alerts" 
              desc="Play notification sounds for high-priority incidents." 
              isOn={formData.audioAlerts} 
              onToggle={() => handleToggle('audioAlerts')}
            />
            <SettingToggle 
              title="Dark Mode Engine" 
              desc="Use high-contrast dark theme for low-light environments." 
              isOn={formData.darkModeEngine} 
              onToggle={() => handleToggle('darkModeEngine')}
            />
            <SettingToggle 
              title="AI Dispatch Suggestions" 
              desc="Allow the AI to suggest the most optimal response unit." 
              isOn={formData.aiDispatch} 
              onToggle={() => handleToggle('aiDispatch')}
            />
          </div>
        </section>

        {/* System & Security */}
        <section>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">security</span>
            Security & System
          </h3>
          <div className="bg-surface-darker border border-border-dark/30 rounded-xl p-6">
            <div className="flex flex-wrap gap-4">
              <button className="bg-surface-dark hover:bg-surface-darker border border-border-dark text-white px-6 py-2 rounded-lg transition-all text-sm font-medium">Change Passcode</button>
              <button className="bg-surface-dark hover:bg-surface-darker border border-border-dark text-white px-6 py-2 rounded-lg transition-all text-sm font-medium">Session Logs</button>
              <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-6 py-2 rounded-lg transition-all text-sm font-medium">Revoke All Access</button>
            </div>
          </div>
        </section>

        <div className="pt-4 flex justify-end gap-3">
           <button 
             onClick={() => setFormData(currentSettings)}
             className="px-6 py-2 rounded-lg text-[#9cabba] font-medium hover:text-white transition-colors"
           >
             Discard Changes
           </button>
           <button 
             onClick={handleSave}
             disabled={saving}
             className="px-8 py-2 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
           >
             {saving ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : null}
             Save All Changes
           </button>
        </div>
      </div>
    </div>
  );
};

const SettingToggle: React.FC<{ title: string; desc: string; isOn: boolean; onToggle: () => void }> = ({ title, desc, isOn, onToggle }) => {
  return (
    <div className="flex items-center justify-between p-6">
      <div className="flex-1">
        <h4 className="text-white font-semibold text-sm">{title}</h4>
        <p className="text-[#9cabba] text-xs mt-0.5">{desc}</p>
      </div>
      <button 
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-darker ${isOn ? 'bg-primary' : 'bg-slate-700'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
};

export default SettingsPage;
