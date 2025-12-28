
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import IncidentFeed from './components/IncidentFeed';
import IncidentDetail from './components/IncidentDetail';
import HistoryPage from './components/HistoryPage';
import FleetPage from './components/FleetPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import { Incident, ViewType, UserSettings, IncidentPriority } from './types';
import { auth, db, collection, query, onSnapshot, onAuthStateChanged, doc, setDoc } from './firebase';

const DEFAULT_SETTINGS: UserSettings = {
  displayName: "Officer K. Deckard",
  operatorId: "884-Alpha",
  email: "deckard.k@omni-guard.gov",
  realTimeFeed: true,
  audioAlerts: true,
  darkModeEngine: true,
  aiDispatch: false,
  photoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxgMA9CxcWTXL41w5ovMX7ynI3CIzKntAcTrb1TvVgbbzWyWYypWre9aFneeTLtNHPRQaeQPS8rVJr80fxt_2bUSeCsDwuEAe0zSj5pAj0jtRpnxunRJYoiJfcxTqtg2-gzNpIIjTZBrbD3WxW5ZPtDsYQIzhmqDjh1tgF6L7iSISexSlItp0mQdAeu_6IMFi_6ouMdDs8VKCMo8pdbyipjPijmg8n9shniPre0qVXjjPRWdA5g6GNVVWtEABpGDqanNn8p-WdHic"
};

// High-priority alert sound URL (Mission Critical Chime)
const ALERT_SOUND_URL = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  
  // Track which incidents have already triggered a notification to avoid duplicates
  const notifiedIncidentIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (!authUser) {
        setUserSettings(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Settings Listener
  useEffect(() => {
    if (!user) return;

    const settingsRef = doc(db, "operatorSettings", user.uid);
    const unsubscribe = onSnapshot(settingsRef, async (docSnap) => {
      if (docSnap.exists()) {
        setUserSettings(docSnap.data() as UserSettings);
      } else {
        await setDoc(settingsRef, DEFAULT_SETTINGS);
        setUserSettings(DEFAULT_SETTINGS);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Firestore Incidents Listener
  useEffect(() => {
    if (!user) return;

    setIncidentsLoading(true);
    const q = query(collection(db, "incidents"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedIncidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Incident[];
      
      setIncidents(fetchedIncidents);
      setIncidentsLoading(false);
      
      // Auto-select first incident if none selected or if previously selected is gone
      if (fetchedIncidents.length > 0 && !selectedIncident) {
        setSelectedIncident(fetchedIncidents[0]);
      } else if (selectedIncident) {
        // Update the selected incident reference with new data if available
        const updated = fetchedIncidents.find(i => i.id === selectedIncident.id);
        if (updated) setSelectedIncident(updated);
      }
    }, (error) => {
      console.error("Error fetching incidents:", error);
      setIncidentsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Audio Alert Logic
  useEffect(() => {
    if (incidentsLoading || !userSettings?.audioAlerts || incidents.length === 0) {
      if (isInitialLoad.current && incidents.length > 0) {
        incidents.forEach(inc => notifiedIncidentIds.current.add(inc.id));
        isInitialLoad.current = false;
      }
      return;
    }

    let shouldPlaySound = false;
    incidents.forEach(incident => {
      const isHighPriority = incident.priority === IncidentPriority.HIGH || incident.priority === IncidentPriority.CRITICAL;
      if (isHighPriority && !notifiedIncidentIds.current.has(incident.id)) {
        notifiedIncidentIds.current.add(incident.id);
        shouldPlaySound = true;
      }
    });

    if (shouldPlaySound) {
      const audio = new Audio(ALERT_SOUND_URL);
      audio.volume = 0.6;
      audio.play().catch(e => console.warn("Audio playback blocked.", e));
    }
    isInitialLoad.current = false;
  }, [incidents, userSettings?.audioAlerts, incidentsLoading]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return (
    <div className="h-screen w-full bg-background-dark flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-primary font-bold tracking-widest uppercase text-xs">OmniGuard Securing Connection...</p>
      </div>
    </div>
  );

  if (!user) return <LoginPage onLogin={() => {}} />;

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, timeZoneName: 'short'
  }).replace(',', ' •');

  return (
    <div className="flex h-screen w-full bg-background-dark overflow-hidden text-slate-100 font-display">
      <Sidebar activeView={currentView} onViewChange={setCurrentView} settings={userSettings} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header timeString={formattedTime} />
        
        <div className="flex-1 flex overflow-hidden">
          {currentView === 'dashboard' ? (
            <>
              <IncidentFeed 
                incidents={incidents} 
                selectedId={selectedIncident?.id || ''}
                onSelect={setSelectedIncident}
              />
              <main className="flex-1 overflow-y-auto">
                {incidentsLoading ? (
                  <div className="h-full w-full flex items-center justify-center opacity-50">
                    <div className="flex flex-col items-center gap-2">
                       <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                       <p className="text-xs font-bold uppercase tracking-widest">Accessing Secure Feed...</p>
                    </div>
                  </div>
                ) : (
                  <IncidentDetail incident={selectedIncident} />
                )}
              </main>
            </>
          ) : currentView === 'history' ? (
            <HistoryPage incidents={incidents} loading={incidentsLoading} />
          ) : currentView === 'fleet' ? (
            <FleetPage />
          ) : currentView === 'settings' ? (
            <SettingsPage user={user} currentSettings={userSettings} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#9cabba]">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-20">construction</span>
                <p className="text-xl font-medium uppercase tracking-widest opacity-50">{currentView} module under maintenance</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;