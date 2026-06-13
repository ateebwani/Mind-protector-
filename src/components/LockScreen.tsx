import React, { useState, useEffect } from 'react';
import { Zap, Camera, Video, MessageSquare, ShieldAlert, ArrowLeft, Settings, Info } from 'lucide-react';
import { AppLock } from '../types';

interface LockScreenProps {
  appLocks: AppLock[];
  setAppLocks: React.Dispatch<React.SetStateAction<AppLock[]>>;
  onUnlock: () => void;
  onNavigateToSettings: () => void;
  onStayFocused: () => void;
  sessionRemainingSeconds?: number; // Optional countdown for custom active timer
}

export default function LockScreen({
  appLocks,
  setAppLocks,
  onUnlock,
  onNavigateToSettings,
  onStayFocused,
  sessionRemainingSeconds
}: LockScreenProps) {
  const [timeStr, setTimeStr] = useState('04:02');
  const [dateStr, setDateStr] = useState('MONDAY, MAY 15');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [clickCount, setClickCount] = useState<Record<string, number>>({});

  useEffect(() => {
    // Dynamic Clock & Date update
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
      
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
      setDateStr(now.toLocaleDateString([], options).toUpperCase());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format countdown remaining from customizable focus sessions
  const getTimerString = () => {
    if (sessionRemainingSeconds === undefined) return null;
    const hours = Math.floor(sessionRemainingSeconds / 3600);
    const mins = Math.floor((sessionRemainingSeconds % 3600) / 60);
    const secs = sessionRemainingSeconds % 60;
    return `${hours > 0 ? `${hours}:` : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAppLockClick = (appId: string) => {
    // Increment click counts
    setClickCount(prev => ({
      ...prev,
      [appId]: (prev[appId] || 0) + 1
    }));
    
    // Auto-reset message
    setTimeout(() => {
      setClickCount(prev => ({
        ...prev,
        [appId]: Math.max(0, (prev[appId] || 1) - 1)
      }));
    }, 2500);
  };

  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === '0000') {
      setShowEmergencyModal(false);
      onUnlock();
    } else {
      setPinError('Incorrect security credentials. Use (1234) or (0000) for preview bypass.');
      setPinInput('');
    }
  };

  // Helper mapping string to Lucide React component
  const renderAppIcon = (iconStr: string) => {
    switch (iconStr) {
      case 'Camera':
        return <Camera className="text-zinc-200" size={22} />;
      case 'Video':
        return <Video className="text-zinc-200" size={22} />;
      default:
        return <MessageSquare className="text-zinc-200" size={22} />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#0a0a0c] overflow-y-auto relative pb-28 pt-16">
      
      {/* Header Bar */}
      <header className="absolute top-0 left-0 w-full z-40 flex justify-between items-center px-5 h-16 bg-black border-b-2 border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-[#D1FF4D]/30">
            <img 
              alt="UserAvatar" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdzl8l9Oz9SR7_hCKtOnloCm3s0_mR2E-a0Aq7g4NHUOOklgmESfeEny4XKuKbHTPGGSQK3ZVYX4iYuh6YC6bX09iWNeM_6XPJfmVLl0HcIZ4U_YnxbttQrMO-yN_qS1nW5AK2ZELqA9v0Yp8LgzjXUQq5pYcxgWTeFoEO6nOAe4C9qlhtJ5JSXyPu2yiVvYSTakuJC3aWEzW6w3wPlQfbbTnRITgwVAg5QSwuaShwbPJAuzeVBoJwII_FJL2MewtK3VwZa-dY5XqI" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-sans text-xs font-black uppercase tracking-wider text-[#D1FF4D]">Mind Protector</span>
        </div>
        
        {/* Gear icon */}
        <button 
          onClick={onNavigateToSettings}
          className="w-8 h-8 rounded-full bg-black border-2 border-stone-800 hover:border-[#D1FF4D] flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <Settings size={14} />
        </button>
      </header>

      {/* Clock Display Section */}
      <div className="text-center pt-8 mb-4">
        <h1 className="font-sans text-[78px] leading-none font-black tracking-tighter text-white uppercase italic glow-pulse">
          {timeStr}
        </h1>
        <p className="font-sans text-[10px] text-zinc-400 font-bold uppercase tracking-[0.22em] mt-3.5">
          {dateStr}
        </p>
      </div>

      {/* Circle Ring Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-48 h-48 rounded-full border-4 border-[#D1FF4D]/10 flex items-center justify-center animated-focus-ring">
          <div className="text-center flex flex-col items-center z-10 px-4">
            <Zap className="text-[#D1FF4D] animate-pulse mb-2 fill-[#D1FF4D]/20" size={32} />
            
            {sessionRemainingSeconds !== undefined ? (
              <>
                <p className="font-sans text-xl font-black text-white tracking-widest">{getTimerString()}</p>
                <p className="font-sans text-[9px] text-[#D1FF4D] font-black uppercase tracking-widest mt-1">SESSION ACTIVE</p>
              </>
            ) : (
              <>
                <p className="font-sans text-[10px] font-black text-[#D1FF4D] tracking-widest uppercase">FOCUS ACTIVE</p>
                <p className="font-sans text-[9px] text-zinc-500 font-bold uppercase mt-1">LOCKED STATE</p>
              </>
            )}
          </div>

          {/* Decorative glowing overlay */}
          <div className="absolute inset-2 bg-gradient-to-tr from-stone-900/5 to-[#D1FF4D]/5 rounded-full blur-sm pointer-events-none"></div>
        </div>

        <p className="font-sans text-xs text-zinc-400 text-center max-w-[270px] mt-6 leading-relaxed">
          Cognitive flow state engaged. Your distractions are currently silenced.
        </p>
      </div>

      {/* Locked Apps Stack (Instagram, TikTok, Twitter) */}
      <div className="w-full px-5 space-y-3 mb-6">
        {appLocks.map((app) => (
          <div 
            key={app.id} 
            onClick={() => handleAppLockClick(app.id)}
            className="bg-black border-2 border-stone-800 rounded-3xl p-4 flex items-center justify-between group hover:border-[#D1FF4D] transition-all duration-300 cursor-pointer active:scale-[0.99] relative overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-stone-950 flex items-center justify-center border-2 border-stone-850">
                {renderAppIcon(app.icon)}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-sans text-[13px] font-black uppercase text-white tracking-wide">{app.name}</span>
                <span className="font-sans text-[10px] uppercase font-bold text-zinc-500">{app.category}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-sans text-[9.5px] text-zinc-500 font-bold uppercase tracking-wider block">Locked for</span>
              <span className="font-sans text-sm font-black text-[#D1FF4D] tracking-tight uppercase italic">
                {app.remainingMinutes > 0 
                  ? `${Math.floor(app.remainingMinutes / 60)}h ${app.remainingMinutes % 60}m`
                  : '0h 00m'
                }
              </span>
            </div>

            {/* Micro-interaction feedback */}
            {clickCount[app.id] > 0 && (
              <div className="absolute inset-0 bg-[#0c0c0e]/95 flex items-center justify-center text-center px-4 transition-all duration-200">
                <p className="text-[10px] font-sans text-[#D1FF4D] flex items-center gap-1.5 font-bold uppercase tracking-wide">
                  <Info size={11} className="stroke-[2.5]" /> Locked by {app.name} limits. Emergency bypass required.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sticky Bottom Controllers */}
      <footer className="absolute bottom-0 left-0 w-full z-40 flex flex-col items-center gap-2 px-5 pb-6 pt-4 bg-gradient-to-t from-black via-zinc-950/90 to-transparent">
        <button 
          onClick={onStayFocused}
          className="w-full bg-[#D1FF4D] hover:bg-white text-black font-sans text-xs h-12 rounded-xl font-black uppercase tracking-widest active:scale-[0.98] transition-all shadow-[0_4px_22px_rgba(209,255,77,0.22)] cursor-pointer"
        >
          Stay Focused
        </button>
        
        <button 
          onClick={() => {
            setShowEmergencyModal(true);
            setPinError('');
            setPinInput('');
          }}
          className="text-zinc-500 font-sans text-[10px] hover:text-[#D1FF4D] transition-all py-2 active:scale-95 font-black uppercase tracking-widest cursor-pointer"
        >
          Emergency Unlock
        </button>
      </footer>

      {/* Emergency Bypass Passcode Overlay */}
      {showEmergencyModal && (
        <div className="absolute inset-0 z-50 bg-[#070709]/95 backdrop-blur-xl flex flex-col justify-center items-center p-6 animate-fade-in">
          <div className="w-full max-w-xs flex flex-col items-center text-center space-y-6">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center text-rose-400">
              <ShieldAlert size={20} />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-sans text-sm font-black uppercase tracking-wide text-white">Emergency Authorization</h3>
              <p className="font-sans text-[11px] text-zinc-400 max-w-[240px] leading-relaxed">
                Entering your credential passcode overrides existing filters and records an interruption in logs.
              </p>
            </div>

            <form onSubmit={verifyPin} className="w-full space-y-4">
              <div className="flex flex-col space-y-2">
                <input
                  type="password"
                  placeholder="Enter Pin"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full h-12 bg-black border-2 border-stone-800 focus:border-rose-500 rounded-xl text-center text-lg tracking-[0.4em] font-mono text-white outline-none focus:ring-1 focus:ring-rose-500/20 placeholder-stone-800 transition-all placeholder-tracking-normal"
                  autoFocus
                />
                
                {pinError ? (
                  <p className="text-rose-400 text-[10px] font-sans font-bold leading-normal uppercase">
                    {pinError}
                  </p>
                ) : (
                  <p className="text-zinc-500 text-[9px] font-sans font-semibold leading-normal uppercase">
                    💡 Tip: Enter PIN <span className="text-zinc-300 font-mono font-bold">1234</span> to bypass.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="flex-1 h-11 rounded-xl bg-[#121212] border-2 border-stone-800 text-zinc-400 font-sans text-[10px] font-black uppercase hover:text-white transition-all active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-sans text-[10px] font-black uppercase transition-all active:scale-95 shadow-lg shadow-rose-500/15 cursor-pointer"
                >
                  Verify Bypass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
