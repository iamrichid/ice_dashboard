
import React, { useState } from 'react';
import { auth, db, doc, setDoc } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { UserSettings } from '../types';

interface RegisterPageProps {
    onSwitchToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [company, setCompany] = useState('');
    const [countryId, setCountryId] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Create User Settings Document
            const newSettings: UserSettings = {
                displayName: user.displayName || email.split('@')[0], // Default display name
                operatorId: "Pending-ID", // Placeholder until assigned
                email: user.email || email,
                realTimeFeed: true,
                audioAlerts: true,
                darkModeEngine: true,
                aiDispatch: false,
                photoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxgMA9CxcWTXL41w5ovMX7ynI3CIzKntAcTrb1TvVgbbzWyWYypWre9aFneeTLtNHPRQaeQPS8rVJr80fxt_2bUSeCsDwuEAe0zSj5pAj0jtRpnxunRJYoiJfcxTqtg2-gzNpIIjTZBrbD3WxW5ZPtDsYQIzhmqDjh1tgF6L7iSISexSlItp0mQdAeu_6IMFi_6ouMdDs8VKCMo8pdbyipjPijmg8n9shniPre0qVXjjPRWdA5g6GNVVWtEABpGDqanNn8p-WdHic", // Default
                company: company,
                countryId: countryId
            };

            await setDoc(doc(db, "operatorSettings", user.uid), newSettings);

            // Auth listener in App.tsx will handle the rest (redirect to dashboard)

        } catch (err: any) {
            console.error("Registration failed", err);
            setError(err.message || "Failed to register. Please try again.");
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
                        <span className="material-symbols-outlined text-white text-[32px]">person_add</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">New Operator Registration</h1>
                    <p className="text-[#9cabba] text-sm mt-1">Join the OmniGuard Network</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="e.g. officer@omni-guard.gov"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-surface-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
                        <input
                            type="password"
                            required
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-surface-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Company</label>
                            <input
                                type="text"
                                required
                                placeholder="Organization"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="w-full bg-surface-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Country ID</label>
                            <input
                                type="text"
                                required
                                placeholder="ISO Code (e.g. US)"
                                value={countryId}
                                onChange={(e) => setCountryId(e.target.value)}
                                className="w-full bg-surface-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group transition-all mt-4"
                    >
                        {loading ? (
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                Register Account
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-slate-400 text-sm">
                        Already authorized? {' '}
                        <button
                            onClick={onSwitchToLogin}
                            className="text-primary font-bold hover:text-primary/80 transition-colors"
                        >
                            Access Console
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
