import React, { useState } from 'react';
import { 
  ShieldAlert, Camera, Video, MessageSquare, Plus, Search, Trash2, 
  ToggleLeft, ToggleRight, X, Clock, Sliders, Smartphone, Gamepad2 
} from 'lucide-react';
import { AppLock } from '../types';

interface AppLimitsProps {
  appLocks: AppLock[];
  setAppLocks: React.Dispatch<React.SetStateAction<AppLock[]>>;
}

export default function AppLimits({ appLocks, setAppLocks }: AppLimitsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppCategory, setNewAppCategory] = useState('Social Networking');
  const [newAppLimitHours, setNewAppLimitHours] = useState(1);
  const [newAppLimitMins, setNewAppLimitMins] = useState(30);

  const handleToggleLockStatus = (appId: string) => {
    setAppLocks(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          isLocked: !app.isLocked,
          remainingMinutes: !app.isLocked ? app.durationMinutes : 0
        };
      }
      return app;
    }));
  };

  const handleSliderChange = (appId: string, totalMinutes: number) => {
    setAppLocks(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          durationMinutes: totalMinutes,
          remainingMinutes: app.isLocked ? totalMinutes : 0
        };
      }
      return app;
    }));
  };

  const handleDeleteLimit = (appId: string) => {
    setAppLocks(prev => prev.filter(app => app.id !== appId));
  };

  const handleCreateCustomLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    const totalMinutes = (Number(newAppLimitHours) * 60) + Number(newAppLimitMins);
    const newLimit: AppLock = {
      id: String(Date.now()),
      name: newAppName,
      category: newAppCategory,
      icon: newAppCategory === 'Social Networking' ? 'Camera' : 
            newAppCategory === 'Entertainment' ? 'Video' : 'MessageSquare',
      durationMinutes: totalMinutes,
      remainingMinutes: totalMinutes,
      isLocked: true
    };

    setAppLocks(prev => [...prev, newLimit]);
    setShowAddModal(false);
    setNewAppName('');
  };

  const filteredLocks = appLocks.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col pt-16 pb-24 bg-[#0a0a0c] overflow-y-auto px-5 relative">
      
      {/* Title Block */}
      <div className="text-center pt-3 mb-5">
        <p className="font-sans text-[10px] uppercase font-black tracking-[0.2em] text-[#D1FF4D]">Security Suite</p>
        <h2 className="font-sans font-black text-2xl uppercase italic tracking-tighter text-white mt-1">App Filter Restrictions</h2>
      </div>

      {/* Info Warning banner */}
      <div className="bg-[#D1FF4D]/5 border-l-2 border-[#D1FF4D] rounded-xl p-3.5 text-left flex gap-2.5 items-start mb-4">
        <ShieldAlert className="text-[#D1FF4D] shrink-0 mt-0.5" size={16} />
        <div className="space-y-0.5">
          <h4 className="font-sans text-[10px] font-black text-white uppercase tracking-wider">Screen Controls Mode</h4>
          <p className="font-sans text-[10px] text-zinc-400 leading-normal">
            These filters automatically silence push alerts and locks the respective app dashboards when focus mode starts.
          </p>
        </div>
      </div>

      {/* Lookup search box */}
      <div className="relative flex items-center mb-5">
        <Search className="absolute left-3.5 text-zinc-500" size={14} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Lookup active app limits..."
          className="w-full h-10 bg-black focus:bg-black border-2 border-stone-800 focus:border-[#D1FF4D] rounded-xl pl-10 pr-4 text-xs font-sans text-white focus:ring-1 focus:ring-[#D1FF4D]/10 outline-none transition-all placeholder-zinc-650"
        />
      </div>

      {/* Scrollable list of locks with interactive sliders */}
      <div className="space-y-4">
        {filteredLocks.length === 0 ? (
          <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl py-12 text-center text-zinc-500 font-sans text-xs uppercase font-bold tracking-wider">
            No active app filters match your search.
          </div>
        ) : (
          filteredLocks.map((app) => (
            <div 
              key={app.id} 
              className={`bg-[#121212] border-2 border-stone-800 rounded-3xl p-4 flex flex-col transition-all relative ${
                app.isLocked ? '' : 'opacity-60 grayscale-[30%]'
              }`}
            >
              {/* Header inside custom card container */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border-2 border-stone-850">
                    {app.icon === 'Camera' ? <Camera className="text-zinc-200" size={18} /> : 
                     app.icon === 'Video' ? <Video className="text-zinc-200" size={18} /> : 
                     <MessageSquare className="text-zinc-200" size={18} />}
                  </div>
                  <div className="text-left">
                    <span className="font-sans text-[13px] font-black uppercase tracking-wide text-white block">{app.name}</span>
                    <span className="text-[10px] font-sans text-zinc-400 block mt-0.5 uppercase tracking-wide">{app.category}</span>
                  </div>
                </div>

                {/* Switch status toggle */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleToggleLockStatus(app.id)}
                    className="text-zinc-400 hover:text-white transition-opacity cursor-pointer"
                    title={app.isLocked ? "Disable Limit" : "Enable Limit"}
                  >
                    {app.isLocked ? (
                      <ToggleRight size={28} className="text-[#D1FF4D]" />
                    ) : (
                      <ToggleLeft size={28} className="text-zinc-650" />
                    )}
                  </button>

                  <button 
                    onClick={() => handleDeleteLimit(app.id)}
                    className="text-zinc-550 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                    title="Delete restriction"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Slider for limits */}
              {app.isLocked && (
                <div className="mt-4 pt-3.5 border-t-2 border-stone-850 text-left space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-sans font-black text-zinc-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Clock size={10} /> Active limit duration</span>
                    <span className="text-[#D1FF4D] font-mono font-black">
                      {Math.floor(app.durationMinutes / 60)}h {app.durationMinutes % 60}m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="240"
                    step="15"
                    value={app.durationMinutes}
                    onChange={(e) => handleSliderChange(app.id, Number(e.target.value))}
                    className="w-full accent-[#D1FF4D] h-2 bg-black rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-zinc-600 uppercase font-bold tracking-widest">
                    <span>15m dev limit</span>
                    <span>4h max hold</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button helper trigger */}
      <div className="pt-6 text-left">
        <button
          onClick={() => {
            setShowAddModal(true);
            setNewAppName('');
          }}
          className="w-full h-12 bg-[#121212] hover:bg-black border-2 border-stone-800 hover:border-[#D1FF4D] text-white rounded-xl font-sans font-black text-xs uppercase tracking-widest items-center justify-center gap-2 transition-all flex active:scale-95 cursor-pointer"
        >
          <Plus size={14} className="text-[#D1FF4D]" /> Add Custom App Limit
        </button>
      </div>

      {/* Add app limits overlay modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 bg-[#070709]/95 backdrop-blur-xl p-6 flex flex-col justify-between animate-fade-in">
          <div className="space-y-5">
            <div className="flex justify-between items-center pb-3 border-b-2 border-stone-800">
              <span className="font-sans text-xs font-black text-[#D1FF4D] tracking-widest uppercase">New app lock</span>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomLimit} className="space-y-4 text-left">
              <div className="flex flex-col space-y-1.5">
                <label className="text-zinc-500 font-sans text-[10px] font-black uppercase tracking-wider">App Target Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, YouTube, Reddit"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="w-full h-11 bg-black border-2 border-stone-800 focus:border-[#D1FF4D] rounded-xl text-sm font-sans px-4 text-white placeholder-zinc-700 outline-none"
                  autoFocus
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-zinc-500 font-sans text-[10px] font-black uppercase tracking-wider">Category Category</label>
                <select
                  value={newAppCategory}
                  onChange={(e) => setNewAppCategory(e.target.value)}
                  className="w-full h-11 bg-black border-2 border-stone-800 focus:border-[#D1FF4D] rounded-xl text-sm font-sans px-3 text-white outline-none cursor-pointer"
                >
                  <option value="Social Networking" className="bg-black">Social Networking</option>
                  <option value="Entertainment" className="bg-black">Entertainment</option>
                  <option value="Real-time News" className="bg-black">Real-time News</option>
                  <option value="Gaming" className="bg-black">Gaming / Leisure</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-zinc-500 font-sans text-[10px] font-black uppercase tracking-wider">Restriction Limit Target</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-black px-2 py-1.5 border-2 border-stone-800 rounded-xl">
                    <span className="text-xs text-zinc-500 font-sans font-black uppercase">Hours:</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="12" 
                      value={newAppLimitHours} 
                      onChange={(e) => setNewAppLimitHours(Number(e.target.value))}
                      className="w-full bg-transparent text-sm font-mono text-white outline-none text-right pr-2" 
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-black px-2 py-1.5 border-2 border-stone-800 rounded-xl">
                    <span className="text-xs text-zinc-500 font-sans font-black uppercase">Mins:</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="59" 
                      value={newAppLimitMins} 
                      onChange={(e) => setNewAppLimitMins(Number(e.target.value))}
                      className="w-full bg-transparent text-sm font-mono text-white outline-none text-right pr-2" 
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-[#D1FF4D] text-black font-sans font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-all text-center mt-4 cursor-pointer"
              >
                Assemble Lock Restriction
              </button>
            </form>
          </div>

          <button 
            type="button"
            onClick={() => setShowAddModal(false)}
            className="w-full h-11 border-2 border-stone-850 text-zinc-500 font-sans font-black text-xs uppercase tracking-widest rounded-xl hover:text-white hover:border-[#D1FF4D] transition-all text-center cursor-pointer"
          >
            Cancel Addition
          </button>
        </div>
      )}

    </div>
  );
}
