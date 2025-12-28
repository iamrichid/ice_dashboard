
import React, { useState } from 'react';
import { auth, signInAnonymously } from '../firebase';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [passcode, setPasscode] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Authenticating via Firebase
      await signInAnonymously(auth);
      onLogin();
    } catch (error) {
      console.error("Authorization failed. Please check your process.env configuration.", error);
      alert("System Auth Failed: Connection to Firebase cluster refused. Verify environment keys.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-background-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-surface-darker/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="size-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/40 mb-4 rotate-3">
            <span className="material-symbols-outlined text-white text-[32px]">shield</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">OmniGuard Command</h1>
          <p className="text-[#9cabba] text-sm mt-1">Personnel Authorization Required</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Operator Identity</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-slate-400">badge</span>
              <input 
                type="text" 
                placeholder="Enter ID (e.g. 884-Alpha)"
                defaultValue="884-Alpha"
                className="w-full bg-surface-dark/50 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Security Passcode</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-slate-400">lock</span>
              <input 
                type="password" 
                placeholder="••••••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-surface-dark/50 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group transition-all"
          >
            {loading ? (
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Authorize Console
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <span>v3.4.0 (Production Live)</span>
          <span className="flex items-center gap-1 text-green-500">
            <span className="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Cloud-Sync: Active
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
