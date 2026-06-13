import React, { useState } from 'react';
import { 
  User, Shield, Rocket, Coffee, Bell, AppWindow, Palette, RefreshCw, 
  Info, ChevronRight, Check, Sparkles, Smartphone, HelpCircle 
} from 'lucide-react';
import { FocusModeType, SystemConfig } from '../types';

interface SettingsScreenProps {
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  selectedMode: FocusModeType;
  setSelectedMode: React.Dispatch<React.SetStateAction<FocusModeType>>;
  config: SystemConfig;
  setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
  onSignOut: () => void;
  onNavigateToLimits: () => void;
  onNavigateToProfile?: () => void;
  appLocksCount: number;
}

export default function SettingsScreen({
  userName,
  setUserName,
  selectedMode,
  setSelectedMode,
  config,
  setConfig,
  onSignOut,
  onNavigateToLimits,
  onNavigateToProfile,
  appLocksCount
}: SettingsScreenProps) {
  const [profileEdit, setProfileEdit] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [syncing, setSyncing] = useState(false);
  const [syncTime, setSyncTime] = useState(config.lastSynced);

  const handleToggleSmartNotifications = () => {
    setConfig(prev => ({
      ...prev,
      smartNotifications: !prev.smartNotifications
    }));
  };

  const handleTriggerSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      const now = new Date();
      const updatedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ago';
      setSyncTime('Just synced');
      setConfig(prev => ({
        ...prev,
        lastSynced: 'Just synced'
      }));
    }, 1200);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName);
      setProfileEdit(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-16 pb-24 bg-[#0a0a0c] overflow-y-auto px-5">
      
      {/* Title Header */}
      <div className="text-left pt-3 mb-6">
        <h2 className="font-sans font-black text-2xl uppercase italic tracking-tighter text-white">Settings</h2>
        <p className="font-sans text-xs text-zinc-400 mt-1 uppercase tracking-wider">Personalize your high-performance environment.</p>
      </div>

      {/* Profile Name Edit Form Trigger */}
      {profileEdit ? (
        <form onSubmit={handleSaveProfile} className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-4 mb-5 text-left space-y-3">
          <label className="text-zinc-500 font-sans text-[10px] font-black uppercase tracking-wider">Edit profile name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="flex-1 h-10 bg-black border-2 border-stone-800 rounded-xl px-3 text-xs text-white placeholder-zinc-700 outline-none focus:border-[#D1FF4D]"
              autoFocus
            />
            <button 
              type="submit"
              className="px-4 bg-[#D1FF4D] text-black h-10 rounded-xl font-sans text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              Save
            </button>
            <button 
              type="button" 
              onClick={() => setProfileEdit(false)}
              className="px-3 border-2 border-stone-800 rounded-xl text-xs text-zinc-400 font-sans font-black uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {/* Account Settings Category */}
      <div className="space-y-4">
        
        {/* Section title */}
        <h4 className="font-sans text-[10px] text-zinc-400 font-black uppercase tracking-widest text-left">Account</h4>

        <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl overflow-hidden">
          
          {/* Action Row 1: Personal profile */}
          <div 
            onClick={() => {
              if (onNavigateToProfile) {
                onNavigateToProfile();
              } else {
                setProfileEdit(true);
                setTempName(userName);
              }
            }}
            className="p-4 flex items-center justify-between hover:bg-black transition-colors cursor-pointer group border-b border-stone-850"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center border-2 border-stone-850 text-[#D1FF4D]">
                <User size={16} />
              </div>
              <div className="text-left">
                <span className="font-sans text-[12px] font-black uppercase text-white tracking-wide block">Personal Profile</span>
                <span className="text-[10px] font-sans text-zinc-400 block mt-0.5">Focus User: {userName}</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
          </div>

          {/* Action Row 2: Security & Access */}
          <div className="p-4 flex items-center justify-between hover:bg-black transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center border-2 border-stone-850 text-[#D1FF4D]">
                <Shield size={16} />
              </div>
              <div className="text-left">
                <span className="font-sans text-[12px] font-black uppercase text-white tracking-wide block">Security & Access</span>
                <span className="text-[10px] font-sans text-zinc-400 block mt-0.5">Credentials, 2FA, & secure biometric parameters</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
          </div>

        </div>

      </div>

      {/* Focus Modes Selection Category */}
      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center px-1">
          <h4 className="font-sans text-[10px] text-zinc-400 font-black uppercase tracking-widest">Focus Modes</h4>
          <span className="font-sans text-[10px] text-zinc-500 font-black uppercase tracking-wider cursor-pointer hover:text-white">Edit Modes</span>
        </div>

        <div className="space-y-2.5">
          
          {/* Radio Row 1: Deep Work */}
          <div 
            onClick={() => setSelectedMode('Deep Work')}
            className={`bg-[#121212] rounded-3xl p-4 flex items-center justify-between border-2 cursor-pointer transition-all ${
              selectedMode === 'Deep Work' ? 'border-[#D1FF4D] bg-[#D1FF4D]/5' : 'border-stone-800 hover:bg-black'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center border-2 border-stone-850 text-[#D1FF4D]">
                <Rocket size={16} className={selectedMode === 'Deep Work' ? 'animate-pulse' : ''} />
              </div>
              <span className="font-sans text-[13px] font-black uppercase tracking-wide text-white">Deep Work</span>
            </div>
            
            {/* Custom styled Radio bullet or checkbox indicator */}
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
              selectedMode === 'Deep Work' ? 'bg-[#D1FF4D]' : 'border-2 border-stone-800'
            }`}>
              {selectedMode === 'Deep Work' && <Check size={11} className="text-black stroke-[4]" />}
            </div>
          </div>

          {/* Radio Row 2: Light Flow */}
          <div 
            onClick={() => setSelectedMode('Light Flow')}
            className={`bg-[#121212] rounded-3xl p-4 flex items-center justify-between border-2 cursor-pointer transition-all ${
              selectedMode === 'Light Flow' ? 'border-[#D1FF4D] bg-[#D1FF4D]/5' : 'border-stone-800 hover:bg-black'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center border-2 border-stone-850 text-[#D1FF4D]">
                <Coffee size={16} />
              </div>
              <span className="font-sans text-[13px] font-black uppercase tracking-wide text-white">Light Flow</span>
            </div>
            
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
              selectedMode === 'Light Flow' ? 'bg-[#D1FF4D]' : 'border-2 border-stone-800'
            }`}>
              {selectedMode === 'Light Flow' && <Check size={11} className="text-black stroke-[4]" />}
            </div>
          </div>

        </div>
      </div>

      {/* Preferences category matches the screenshot perfectly */}
      <div className="space-y-4 mt-6">
        <h4 className="font-sans text-[10px] text-zinc-400 font-black uppercase tracking-widest text-left">Preferences</h4>

        <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl overflow-hidden divide-y-2 divide-stone-850">
          
          {/* Preference Row 1: Smart notifications */}
          <div className="p-4 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center border-2 border-stone-850 text-[#D1FF4D]">
                <Bell size={16} />
              </div>
              <div>
                <span className="font-sans text-[12px] font-black uppercase text-white tracking-wide block">Smart Notifications</span>
                <span className="text-[10px] font-sans text-zinc-400 block mt-0.5">Mute during active focus blocks</span>
              </div>
            </div>
            
            {/* Custom visual checkbox ticker matching output style */}
            <button 
              onClick={handleToggleSmartNotifications}
              className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all cursor-pointer ${
                config.smartNotifications 
                  ? 'bg-[#D1FF4D] border-[#D1FF4D]' 
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {config.smartNotifications && <Check size={11} className="text-black stroke-[4]" />}
            </button>
          </div>

          {/* Preference Row 2: App Limits summary */}
          <div 
            onClick={onNavigateToLimits}
            className="p-4 flex items-center justify-between hover:bg-black transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center border-2 border-stone-850 text-[#D1FF4D]">
                <AppWindow size={16} />
              </div>
              <div className="text-left">
                <span className="font-sans text-[12px] font-black uppercase text-white tracking-wide block">App Limits</span>
                <span className="text-[10px] font-sans text-zinc-400 block mt-0.5">{appLocksCount} active security limits configured</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="bg-black border-2 border-stone-850 px-3 py-1 text-[10px] font-mono font-bold text-zinc-350 rounded-md">
                {appLocksCount} Apps
              </span>
              <ChevronRight size={14} className="text-zinc-650 group-hover:text-white transition-colors" />
            </div>
          </div>

          {/* Preference Row 3: Interface style */}
          <div className="p-4 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center border-2 border-stone-850 text-[#D1FF4D]">
                <Palette size={16} />
              </div>
              <div>
                <span className="font-sans text-[12px] font-black uppercase text-white tracking-wide block">Interface Style</span>
                <span className="text-[10px] font-sans text-zinc-400 block mt-0.5">OLED Dark • Neon Lime accents</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-zinc-600" />
          </div>

        </div>
      </div>

      {/* System category */}
      <div className="space-y-4 mt-6">
        <h4 className="font-sans text-[10px] text-zinc-400 font-black uppercase tracking-widest text-left">System</h4>

        <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl overflow-hidden divide-y-2 divide-stone-850">
          
          {/* System Row 1: Cloud sync action */}
          <div 
            onClick={handleTriggerSync}
            className="p-4 flex items-center justify-between hover:bg-black transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center border-2 border-stone-850 text-[#D1FF4D]">
                <RefreshCw size={16} className={syncing ? 'animate-spin text-[#D1FF4D]' : ''} />
              </div>
              <div>
                <span className="font-sans text-[12px] font-black uppercase text-white tracking-wide block">Cloud Synchronization</span>
                <span className="text-[10px] font-sans text-zinc-400 block mt-0.5">Last synced: {syncTime}</span>
              </div>
            </div>
            
            <span className="text-[9px] font-sans font-black text-zinc-500 uppercase group-hover:text-white transition-colors">
              {syncing ? 'SYNCING...' : 'SYNC NOW'}
            </span>
          </div>

          {/* System Row 2: About app information */}
          <div className="p-4 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center border-2 border-stone-850 text-[#D1FF4D]">
                <Info size={16} />
              </div>
              <div>
                <span className="font-sans text-[12px] font-black uppercase text-white tracking-wide block">About Mind Protector v2.4.0</span>
                <span className="text-[10px] font-sans text-zinc-400 block mt-0.5">Engineered for absolute cognitive flow enhancement</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-zinc-650" />
          </div>

        </div>
      </div>

      {/* Exit Sign Out Button */}
      <div className="pt-6 text-left">
        <button
          onClick={onSignOut}
          className="w-full bg-[#121212] hover:bg-red-950/20 text-red-500 border-2 border-stone-800 hover:border-red-900/60 font-sans text-xs h-12 rounded-xl font-black uppercase tracking-widest active:scale-[0.98] transition-all cursor-pointer"
        >
          Sign Out of All Devices
        </button>
      </div>

    </div>
  );
}
