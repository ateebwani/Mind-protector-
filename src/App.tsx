import React, { useState, useEffect } from 'react';
import { 
  Home, Zap, BarChart2, Shield, Settings, Lock, HelpCircle, Sparkles, 
  BookOpen, Compass, RotateCcw, Play, CheckCircle2, ShieldAlert, Laptop, Info, User 
} from 'lucide-react';

import PhoneFrame from './components/PhoneFrame';
import LoginScreen from './components/LoginScreen';
import LockScreen from './components/LockScreen';
import HomeDashboard from './components/HomeDashboard';
import FlowSession from './components/FlowSession';
import Statistics from './components/Statistics';
import AppLimits from './components/AppLimits';
import SettingsScreen from './components/SettingsScreen';
import UserProfileSection from './components/UserProfileSection';
import { UserAccount } from './lib/firebase';

import { AppLock, FocusSessionLog, CommunityPost, SystemConfig, FocusModeType } from './types';

// Seed initial App Lock Limits
const INITIAL_APP_LOCKS: AppLock[] = [
  { id: '1', name: 'Instagram', category: 'Social Networking', icon: 'Camera', durationMinutes: 80, remainingMinutes: 80, isLocked: true },
  { id: '2', name: 'TikTok', category: 'Entertainment', icon: 'Video', durationMinutes: 105, remainingMinutes: 105, isLocked: true },
  { id: '3', name: 'Twitter', category: 'Real-time News', icon: 'MessageSquare', durationMinutes: 55, remainingMinutes: 55, isLocked: true }
];

// Seed initial Community Discussions
const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'p1',
    username: 'Marcus',
    userTitle: 'Product Lead',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdzl8l9Oz9SR7_hCKtOnloCm3s0_mR2E-a0Aq7g4NHUOOklgmESfeEny4XKuKbHTPGGSQK3ZVYX4iYuh6YC6bX09iWNeM_6XPJfmVLl0HcIZ4U_YnxbttQrMO-yN_qS1nW5AK2ZELqA9v0Yp8LgzjXUQq5pYcxgWTeFoEO6nOAe4C9qlhtJ5JSXyPu2yiVvYSTakuJC3aWEzW6w3wPlQfbbTnRITgwVAg5QSwuaShwbPJAuzeVBoJwII_FJL2MewtK3VwZa-dY5XqI',
    text: 'Cutting social media by 40% doubled my morning output.',
    likes: 84,
    likedByUser: false,
    repliesCount: 12,
    timeAgo: '4m ago'
  },
  {
    id: 'p2',
    username: 'Sarah',
    userTitle: 'Software Engineer',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdzl8l9Oz9SR7_hCKtOnloCm3s0_mR2E-a0Aq7g4NHUOOklgmESfeEny4XKuKbHTPGGSQK3ZVYX4iYuh6YC6bX09iWNeM_6XPJfmVLl0HcIZ4U_YnxbttQrMO-yN_qS1nW5AK2ZELqA9v0Yp8LgzjXUQq5pYcxgWTeFoEO6nOAe4C9qlhtJ5JSXyPu2yiVvYSTakuJC3aWEzW6w3wPlQfbbTnRITgwVAg5QSwuaShwbPJAuzeVBoJwII_FJL2MewtK3VwZa-dY5XqI',
    text: 'Used the new Flow-Sync feature for my coding sprints today.',
    likes: 56,
    likedByUser: true,
    repliesCount: 5,
    timeAgo: '1h ago'
  }
];

// Seed historical Focus Session logs
const INITIAL_LOGS: FocusSessionLog[] = [
  { id: 'l1', date: 'Fri, Jun 12', durationMinutes: 90, mode: 'Deep Work', status: 'completed', category: 'UI Design' },
  { id: 'l2', date: 'Thu, Jun 11', durationMinutes: 45, mode: 'Light Flow', status: 'completed', category: 'Research' },
  { id: 'l3', date: 'Wed, Jun 10', durationMinutes: 60, mode: 'Creative', status: 'interrupted', category: 'Writing' }
];

export default function App() {
  // Authentication & Profile States
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('lumina_logged_in') === 'true');
  const [userName, setUserName] = useState(() => localStorage.getItem('lumina_username') || 'Alex');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('lumina_email') || 'alex@company.com');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('lumina_current_user');
    if (saved) return JSON.parse(saved);
    if (localStorage.getItem('lumina_logged_in') === 'true') {
      return {
        uid: 'user_alex',
        name: localStorage.getItem('lumina_username') || 'Alex Rivera',
        email: localStorage.getItem('lumina_email') || 'alex@company.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedDate: 'Jun 2026',
        marketingPreference: true,
        cognitiveFocusGoal: '4.8h/day'
      };
    }
    return null;
  });

  // Device Framework configuration
  const [deviceOS, setDeviceOS] = useState<'ios' | 'android'>('ios');
  const [activeTab, setActiveTab] = useState<'home' | 'flow' | 'statistics' | 'limits' | 'settings' | 'lock' | 'profile'>('home');
  const [isLocked, setIsLocked] = useState(false);

  // Model-level state variables
  const [appLocks, setAppLocks] = useState<AppLock[]>(() => {
    const saved = localStorage.getItem('lumina_app_locks');
    return saved ? JSON.parse(saved) : INITIAL_APP_LOCKS;
  });
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [logs, setLogs] = useState<FocusSessionLog[]>(() => {
    const saved = localStorage.getItem('lumina_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // System general config
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    deviceOS: 'ios',
    themeColor: '#adc6ff',
    smartNotifications: true,
    biometricLockEnabled: true,
    cloudSync: true,
    lastSynced: '2m ago'
  });

  // Active Session countdown parameters
  const [sessionSecondsRemaining, setSessionSecondsRemaining] = useState<number | undefined>(undefined);
  const [currentSessionMode, setCurrentSessionMode] = useState<FocusModeType>('Deep Work');

  // Manual Quick Log Modal
  const [showQuickLogModal, setShowQuickLogModal] = useState(false);
  const [quickLogDuration, setQuickLogDuration] = useState(45);
  const [quickLogMode, setQuickLogMode] = useState<FocusModeType>('Deep Work');
  const [quickLogSuccess, setQuickLogSuccess] = useState(false);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('lumina_app_locks', JSON.stringify(appLocks));
  }, [appLocks]);

  useEffect(() => {
    localStorage.setItem('lumina_logs', JSON.stringify(logs));
  }, [logs]);

  // Session clock countdown controller
  useEffect(() => {
    let timer: any;
    if (sessionSecondsRemaining !== undefined && sessionSecondsRemaining > 0) {
      timer = setInterval(() => {
        setSessionSecondsRemaining(prev => {
          if (prev === undefined || prev <= 1) {
            // Focus session successfully completed! Record log entry
            handleFocusSuccess();
            return undefined;
          }
          
          // Decrement remaining app lock times as well for live feedback
          if (prev % 60 === 0) {
            setAppLocks(locks => locks.map(l => {
              if (l.isLocked && l.remainingMinutes > 0) {
                return { ...l, remainingMinutes: l.remainingMinutes - 1 };
              }
              return l;
            }));
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionSecondsRemaining]);

  const handleFocusSuccess = () => {
    const newLog: FocusSessionLog = {
      id: String(Date.now()),
      date: new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
      durationMinutes: 90, // default registered
      mode: currentSessionMode,
      status: 'completed',
      category: 'UI Design'
    };
    setLogs(prev => [newLog, ...prev]);
    setIsLocked(false);
    setActiveTab('statistics');
    alert(`🎉 Congratulations! You have successfully completed your custom ${currentSessionMode} flow block!`);
  };

  const handleLogin = (user: UserAccount) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    localStorage.setItem('lumina_logged_in', 'true');
    localStorage.setItem('lumina_username', user.name);
    localStorage.setItem('lumina_email', user.email);
    localStorage.setItem('lumina_current_user', JSON.stringify(user));
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('lumina_logged_in');
    localStorage.removeItem('lumina_username');
    localStorage.removeItem('lumina_email');
    localStorage.removeItem('lumina_current_user');
    setActiveTab('home');
    setIsLocked(false);
    setSessionSecondsRemaining(undefined);
  };

  // Launch Active Lock Screen
  const handleStartActiveFocusTheme = (minutes: number, mode: FocusModeType) => {
    setCurrentSessionMode(mode);
    setSessionSecondsRemaining(minutes * 60);
    setIsLocked(true);
    setActiveTab('lock');
  };

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: FocusSessionLog = {
      id: String(Date.now()),
      date: new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
      durationMinutes: Number(quickLogDuration),
      mode: quickLogMode,
      status: 'completed',
      category: 'UI Design'
    };
    
    setLogs(prev => [newLog, ...prev]);
    setQuickLogSuccess(true);
    setTimeout(() => {
      setQuickLogSuccess(false);
      setShowQuickLogModal(false);
    }, 1200);
  };

  // Switch tabs & ensure state locking consistency
  const handleTabChange = (tab: any) => {
    if (tab === 'lock') {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }
    setActiveTab(tab);
  };

  // Simulate week metrics list
  const WEEKLY_DATA = [
    { day: 'Mon', hours: 4.2, sessions: 3 },
    { day: 'Tue', hours: 5.5, sessions: 4 },
    { day: 'Wed', hours: 3.8, sessions: 2 },
    { day: 'Thu', hours: 6.0, sessions: 5 },
    { day: 'Fri', hours: 4.8, sessions: 3 },
    { day: 'Sat', hours: 2.1, sessions: 1 },
    { day: 'Sun', hours: 1.5, sessions: 1 }
  ];

  return (
    <div className="min-h-screen bg-[#070707] flex flex-col xl:flex-row items-center justify-center p-4 xl:p-8 gap-8 xl:gap-12 text-white selection:bg-[#D1FF4D]/25 overflow-x-hidden">
      
      {/* LEFT COLUMN: Premium Descriptonal Marketing Dashboard Flank */}
      <div className="w-full xl:w-[420px] shrink-0 text-left space-y-6 max-w-lg">
        
        <div className="space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D1FF4D] text-black text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={11} className="stroke-[2.5]" />
            <span>Premium Suite v2.4</span>
          </div>
          <h1 className="font-sans font-black text-6xl sm:text-7xl leading-[0.95] text-white uppercase italic tracking-tighter">
            Mind<br />
            <span className="text-[#D1FF4D]">Protector</span>
          </h1>
          <p className="text-zinc-500 font-bold tracking-widest uppercase text-xs italic block pt-3 border-t border-zinc-800">
            Cross-Platform Visual System v2.0
          </p>
          <p className="font-sans text-xs text-zinc-400 leading-relaxed">
            A high-performance focus system designed to mute social distractions, synchronize neural breathing tempos, and track deep performance logs.
          </p>
        </div>

        {/* Feature Checklist */}
        <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <h3 className="font-sans text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={14} className="text-[#D1FF4D]" /> Interactive Features Checklist
          </h3>
          <ul className="space-y-3 text-xs text-zinc-400 font-sans">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={14} className="text-[#D1FF4D] shrink-0 mt-0.5" />
              <span>
                <strong>Cross-Platform Frame Switcher:</strong> Instantly toggle device layouts between iOS and Android status parameters.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={14} className="text-[#D1FF4D] shrink-0 mt-0.5" />
              <span>
                <strong>Simulation Bypass passcode:</strong> Enter <span className="font-mono text-white bg-black border border-stone-800 px-1.5 py-0.5 rounded">1234</span> in Emergency Unlock to lift constraints.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={14} className="text-[#D1FF4D] shrink-0 mt-0.5" />
              <span>
                <strong>Neural Sound Synthesizer:</strong> Start relaxing rain peaks, sky frequency, or cosmic ambient waves.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={14} className="text-[#D1FF4D] shrink-0 mt-0.5" />
              <span>
                <strong>Limit sliders & Custom locks:</strong> Add Facebook or Netflix app limits and adjust restrictive hours or minutes.
              </span>
            </li>
          </ul>
        </div>

        {/* Flank Quick Emulator Controllers */}
        <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <h3 className="font-sans text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Laptop size={14} className="text-[#D1FF4D]" /> Emulator Fast Triggers
          </h3>
          
          <div className="grid grid-cols-2 gap-2 text-[10px] font-sans">
            <button 
              onClick={() => {
                setIsLocked(true);
                setActiveTab('lock');
              }}
              className="py-2.5 bg-black hover:bg-[#D1FF4D] hover:text-black hover:border-[#D1FF4D] text-zinc-300 border border-stone-800 rounded-xl transition-all font-black uppercase tracking-wider active:scale-95 cursor-pointer"
            >
              🔒 Active Screen Limit
            </button>
            <button 
              onClick={() => {
                setIsLocked(false);
                setActiveTab('home');
              }}
              className="py-2.5 bg-black hover:bg-[#D1FF4D] hover:text-black hover:border-[#D1FF4D] text-zinc-300 border border-stone-800 rounded-xl transition-all font-black uppercase tracking-wider active:scale-95 cursor-pointer"
            >
              🔓 Bypass Screen Lock
            </button>
            <button 
              onClick={() => {
                setUserName('Chief Officer');
                localStorage.setItem('lumina_username', 'Chief Officer');
              }}
              className="py-2.5 bg-black hover:bg-[#D1FF4D] hover:text-black hover:border-[#D1FF4D] text-zinc-300 border border-stone-800 rounded-xl transition-all font-black uppercase tracking-wider active:scale-95 cursor-pointer"
            >
              👤 Rename to "Chief"
            </button>
            <button 
              onClick={() => {
                // Seed custom quick completed log 
                const logItem: FocusSessionLog = {
                  id: String(Date.now()),
                  date: new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
                  durationMinutes: 90,
                  mode: 'Deep Work',
                  status: 'completed',
                  category: 'Research'
                };
                setLogs(prev => [logItem, ...prev]);
                alert('⚡ Simulated quick focus log added!');
              }}
              className="py-2.5 bg-black hover:bg-[#D1FF4D] hover:text-black hover:border-[#D1FF4D] text-zinc-300 border border-stone-800 rounded-xl transition-all font-black uppercase tracking-wider active:scale-95 cursor-pointer"
            >
              ⚡ Simulated Log log
            </button>
          </div>
        </div>

      </div>

      {/* CENTER COLUMN: Beautiful Simulated Device frame housing the UI */}
      <div className="relative shrink-0 w-full max-w-[390px]">
        <PhoneFrame 
          os={deviceOS} 
          setOs={setDeviceOS}
          onHomePress={() => {
            if (isLoggedIn) {
              setIsLocked(false);
              setActiveTab('home');
            }
          }}
        >
          {/* Inner dynamic view allocation depending on state parameters */}
          {!isLoggedIn ? (
            <LoginScreen onLoginSuccess={handleLogin} />
          ) : isLocked || activeTab === 'lock' ? (
            <LockScreen
              appLocks={appLocks}
              setAppLocks={setAppLocks}
              onUnlock={() => {
                setIsLocked(false);
                setActiveTab('home');
              }}
              onNavigateToSettings={() => handleTabChange('settings')}
              onStayFocused={() => {
                setIsLocked(true);
                setActiveTab('lock');
              }}
              sessionRemainingSeconds={sessionSecondsRemaining}
            />
          ) : (
            /* Tab layouts */
            <div className="w-full h-full relative">
              {activeTab === 'home' && (
                <HomeDashboard
                  userName={userName}
                  userAvatarUrl={currentUser?.avatarUrl}
                  onNavigate={handleTabChange}
                  appLocks={appLocks}
                  posts={posts}
                  setPosts={setPosts}
                  onOpenQuickLog={() => {
                    setShowQuickLogModal(true);
                    setQuickLogSuccess(false);
                  }}
                  onSignOut={handleSignOut}
                />
              )}

              {activeTab === 'profile' && currentUser && (
                <UserProfileSection
                  currentUser={currentUser}
                  onProfileUpdated={(updatedUser) => {
                    setCurrentUser(updatedUser);
                    setUserName(updatedUser.name);
                    setUserEmail(updatedUser.email);
                    localStorage.setItem('lumina_username', updatedUser.name);
                    localStorage.setItem('lumina_email', updatedUser.email);
                    localStorage.setItem('lumina_current_user', JSON.stringify(updatedUser));
                  }}
                  onBack={() => handleTabChange('home')}
                />
              )}

              {activeTab === 'flow' && (
                <FlowSession
                  onStartActiveTimer={handleStartActiveFocusTheme}
                  onNavigateHome={() => handleTabChange('home')}
                />
              )}

              {activeTab === 'statistics' && (
                <Statistics
                  logs={logs}
                  weeklyStats={WEEKLY_DATA}
                  onNavigateHome={() => handleTabChange('home')}
                />
              )}

              {activeTab === 'limits' && (
                <AppLimits
                  appLocks={appLocks}
                  setAppLocks={setAppLocks}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsScreen
                  userName={userName}
                  setUserName={setUserName}
                  selectedMode={currentSessionMode}
                  setSelectedMode={setCurrentSessionMode}
                  config={systemConfig}
                  setConfig={setSystemConfig}
                  onSignOut={handleSignOut}
                  onNavigateToLimits={() => handleTabChange('limits')}
                  onNavigateToProfile={() => handleTabChange('profile')}
                  appLocksCount={appLocks.length}
                />
              )}

              {/* Sticky bottom Applet navigation bar matching screenshot perfectly */}
              <nav className="absolute bottom-0 left-0 w-full h-[68px] bg-[#121317]/95 backdrop-blur-xl border-t border-white/[0.04] z-40 px-4 flex items-center justify-between select-none">
                {[
                  { id: 'home', label: 'Home', icon: Home },
                  { id: 'flow', label: 'Flow', icon: Zap },
                  { id: 'statistics', label: 'Mind', icon: BarChart2 },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
                        isActive 
                          ? 'text-[#D1FF4D] font-black scale-105' 
                          : 'text-zinc-500 hover:text-zinc-300 font-bold'
                      }`}
                    >
                      <item.icon size={17} className={isActive ? 'text-[#D1FF4D] fill-[#D1FF4D]/10' : ''} />
                      <span className="text-[9px] font-sans tracking-wide uppercase font-black">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Quick Manual Log Dialogue overlay Modal Inside the Phone */}
          {showQuickLogModal && (
            <div className="absolute inset-0 bg-[#070709]/95 backdrop-blur-xl z-50 p-6 flex flex-col justify-between animate-fade-in">
              <div className="space-y-5 text-left">
                <div className="flex justify-between items-center pb-2.5 border-b border-white/[0.04]">
                  <h4 className="font-sans text-xs font-black text-[#D1FF4D] tracking-widest uppercase">Quick Record Logger</h4>
                  <button onClick={() => setShowQuickLogModal(false)} className="text-zinc-500 hover:text-white">
                    <Lock size={16} />
                  </button>
                </div>

                {quickLogSuccess ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                    <CheckCircle2 size={32} className="text-[#D1FF4D] animate-bounce" />
                    <p className="font-sans text-sm font-black text-white uppercase italic">Focus Metrics Logged!</p>
                  </div>
                ) : (
                  <form onSubmit={handleQuickLogSubmit} className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-zinc-400 font-sans text-[10px] font-bold uppercase tracking-wider">Durations (Minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="300"
                        value={quickLogDuration}
                        onChange={(e) => setQuickLogDuration(Number(e.target.value))}
                        className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-3 text-xs text-white outline-none focus:border-[#D1FF4D]"
                        required
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-zinc-400 font-sans text-[10px] font-bold uppercase tracking-wider">Session Category Mode</label>
                      <select
                        value={quickLogMode}
                        onChange={(e) => setQuickLogMode(e.target.value as FocusModeType)}
                        className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-2 text-xs text-white outline-none focus:border-[#D1FF4D]"
                      >
                        <option value="Deep Work">Deep Work</option>
                        <option value="Light Flow">Light Flow</option>
                        <option value="Creative">Creative / Creative Sprints</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 bg-[#D1FF4D] text-[#000000] rounded-xl font-sans font-black text-xs uppercase cursor-pointer"
                    >
                      Sync Manual Log Log
                    </button>
                  </form>
                )}
              </div>

              <button 
                onClick={() => setShowQuickLogModal(false)}
                className="w-full h-11 border border-zinc-800 text-zinc-500 text-xs font-sans font-bold uppercase rounded-xl hover:text-white cursor-pointer"
              >
                Dismiss logger
              </button>
            </div>
          )}
        </PhoneFrame>
      </div>

    </div>
  );
}
