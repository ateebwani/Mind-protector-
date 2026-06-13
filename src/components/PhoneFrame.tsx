import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Radio, Smartphone, HelpCircle } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  os: 'ios' | 'android';
  setOs: (os: 'ios' | 'android') => void;
  onHomePress?: () => void;
}

export default function PhoneFrame({ children, os, setOs, onHomePress }: PhoneFrameProps) {
  const [timeStr, setTimeStr] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(88);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Dynamic battery simulator
    const battInterval = setInterval(() => {
      setBatteryLevel((prev) => (prev > 10 ? prev - 1 : 95));
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(battInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 select-none relative z-10 w-full max-w-lg mx-auto">
      {/* Device OS Switcher (External Control Panel) */}
      <div className="flex bg-[#121212] border-2 border-stone-800 p-1 rounded-full mb-6 gap-2 text-xs font-sans items-center justify-center shadow-lg">
        <span className="text-zinc-500 font-black px-3 py-1 uppercase tracking-wider">Device Style:</span>
        <button
          onClick={() => setOs('ios')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-200 uppercase font-black cursor-pointer ${
            os === 'ios'
              ? 'bg-[#D1FF4D] text-black font-semibold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span className="text-sm"></span> iOS (iPhone)
        </button>
        <button
          onClick={() => setOs('android')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-200 uppercase font-black cursor-pointer ${
            os === 'android'
              ? 'bg-[#D1FF4D] text-black font-semibold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Smartphone size={12} /> Android
        </button>
      </div>

      {/* Main Physical Phone Housing */}
      <div
        className={`relative w-full aspect-[9/19.5] max-w-[390px] border-[#222] bg-[#000] rounded-[48px] overflow-hidden phone-shadow transition-all duration-700 ${
          os === 'ios'
            ? 'border-[12px] ring-1 ring-zinc-800/80 mt-2'
            : 'border-[8px] rounded-[40px] mt-2'
        }`}
      >
        {/* Dynamic Island / Camera Cutout */}
        {os === 'ios' ? (
          /* iOS Dynamic Island */
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[110px] h-7 bg-black rounded-full z-50 flex items-center justify-between px-3 transition-all duration-300 hover:w-[130px]" id="dynamic-island">
            <div className="w-2.5 h-2.5 bg-[#0a0a20] rounded-full ring-2 ring-zinc-900/60" id="camera-lens"></div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <div className="w-4 h-1 bg-[#1c1c1e] rounded-full"></div>
            </div>
          </div>
        ) : (
          /* Android Punch Hole Camera */
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4.5 h-4.5 bg-black rounded-full z-50 ring-1 ring-zinc-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#031525] rounded-full"></div>
          </div>
        )}

        {/* Home Indicator / Navigation Bar for iOS & Android */}
        {os === 'ios' ? (
          /* iOS Bottom Home Bar */
          <div
            onClick={onHomePress}
            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-50 cursor-pointer hover:bg-white/80 active:scale-95 transition-all"
            title="Go to Home"
          ></div>
        ) : (
          /* Android Navigation Pill */
          <div
            onClick={onHomePress}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-white/30 rounded-full z-50 cursor-pointer hover:bg-white/70 active:scale-95 transition-all"
            title="Go to Home Indicator"
          ></div>
        )}

        {/* Screen Status Bar */}
        <div
          className={`absolute top-0 left-0 w-full h-[52px] px-8 flex justify-between items-center z-40 text-xs font-geist tracking-wide text-white/90 select-none ${
            os === 'ios' ? 'pt-8 pb-1' : 'pt-5 pb-0'
          }`}
        >
          {/* Time Display */}
          <div className="font-semibold text-[13px]">{timeStr}</div>

          {/* Connection Indicators */}
          <div className="flex items-center gap-1.5 text-zinc-300">
            {/* Network Signals */}
            <div className="flex gap-0.5 items-end h-[10px]">
              <div className="w-[2px] h-[3px] bg-white rounded-full"></div>
              <div className="w-[2px] h-[5px] bg-white rounded-full"></div>
              <div className="w-[2px] h-[7px] bg-white rounded-full"></div>
              <div className="w-[2px] h-[9px] bg-white rounded-full"></div>
            </div>
            <Wifi size={12} className="text-white" />
            
            {/* Battery percentage */}
            <span className="text-[10px] leading-none text-zinc-400 font-medium">{batteryLevel}%</span>
            <div className="relative flex items-center">
              <Battery size={14} className="text-white/90 fill-white/20" />
              <div 
                className="absolute left-[1.5px] top-[4.5px] h-1.5 bg-green-400 rounded-[1px] transition-all" 
                style={{ width: `${Math.floor((batteryLevel / 100) * 8.5)}px` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Render Inner Screen Content */}
        <div className="w-full h-full bg-[#070709] overflow-hidden relative font-sans flex flex-col">
          {children}
        </div>
      </div>

      {/* Helpful Hint */}
      <p className="mt-4 text-xs font-sans text-zinc-500 text-center flex items-center justify-center gap-1.5">
        <HelpCircle size={12} /> Click bottom housing bar to trigger phone Home action!
      </p>
    </div>
  );
}
