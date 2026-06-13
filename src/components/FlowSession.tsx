import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, HelpCircle, VolumeX, Volume2, ShieldCheck, Moon, Trees, Compass } from 'lucide-react';
import { FocusModeType, NoiseType } from '../types';

interface FlowSessionProps {
  onStartActiveTimer: (minutes: number, mode: FocusModeType) => void;
  onNavigateHome: () => void;
}

export default function FlowSession({ onStartActiveTimer, onNavigateHome }: FlowSessionProps) {
  const [selectedMode, setSelectedMode] = useState<FocusModeType>('Deep Work');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [noise, setNoise] = useState<NoiseType>('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  // Sound Synthesizer reference
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Breathing state controller
  const [breathingStage, setBreathingStage] = useState<'breathe-in' | 'hold' | 'breathe-out'>('breathe-in');
  const [breatheSeconds, setBreatheSeconds] = useState(0);

  // Track regular timer countdown
  useEffect(() => {
    let timer: any;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            // Synth sound finish alert
            triggerCompletionChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  // Handle duration changes
  useEffect(() => {
    if (!isPlaying) {
      setTimeLeft(durationMinutes * 60);
    }
  }, [durationMinutes, isPlaying]);

  // Track breathing loop: 4s breathe-in, 4s hold, 4s breathe-out
  useEffect(() => {
    let breatheTimer: any;
    breatheTimer = setInterval(() => {
      setBreatheSeconds(prev => {
        const next = (prev + 1) % 12;
        if (next < 4) {
          setBreathingStage('breathe-in');
        } else if (next < 8) {
          setBreathingStage('hold');
        } else {
          setBreathingStage('breathe-out');
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(breatheTimer);
  }, []);

  // Web Audio Synth Generator (Muted by default to respect modern sandbox policies)
  const toggleSynthesizerNoise = (type: NoiseType) => {
    try {
      // Clean up previous sound
      cleanupAudio();

      if (type === 'none') {
        setNoise('none');
        return;
      }

      setNoise(type);

      // Create Web Audio instances
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const gainNode = ctx.createGain();
      gainNodeRef.current = gainNode;
      gainNode.connect(ctx.destination);

      if (type === 'white') {
        // Generate continuous white noise buffer
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        
        // Lowpass filter for pleasant "brownish" noise
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        whiteNoise.start();
      } else if (type === 'rain') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.setValueAtTime(140, ctx.currentTime);
        filter.Q.setValueAtTime(15, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gainNode);
        
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        oscillatorRef.current = osc;
      } else if (type === 'synth' || type === 'lofi') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        // Relaxing low note
        osc.frequency.value = 110; 
        
        // Vibrato/tremolo modulation
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 4; // Hz
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 2; // Hz swing
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gainNode);
        
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
        
        lfo.start();
        osc.start();
        
        oscillatorRef.current = osc;
      }
    } catch (e) {
      console.warn("Audio Synthesizer block policies: ", e);
    }
  };

  const triggerCompletionChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(440, ctx.currentTime); // Standard middle A
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start();
      setTimeout(() => osc.stop(), 1000);
    } catch {}
  };

  const cleanupAudio = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch {}
  };

  useEffect(() => {
    return () => cleanupAudio();
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const startActiveFocusedState = () => {
    cleanupAudio();
    onStartActiveTimer(durationMinutes, selectedMode);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between px-5 pt-16 pb-24 bg-[#0a0a0c] overflow-y-auto">
      
      {/* Scrollable controls */}
      <div className="space-y-6 pt-4">
        
        {/* Simple visual section title */}
        <div className="text-center">
          <p className="font-sans text-[10px] uppercase font-black tracking-[0.2em] text-[#D1FF4D]">Flow State Setup</p>
          <h2 className="font-sans font-black text-2xl uppercase italic tracking-tighter text-white mt-1">Neuro-Zone Setup</h2>
        </div>

        {/* Focus Mode Selector (Deep, Light, Creative) */}
        <div className="space-y-2 text-left">
          <label className="text-zinc-500 font-sans text-[10px] font-black uppercase tracking-wider block">Choose Focus Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Deep Work', 'Light Flow', 'Creative'] as FocusModeType[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`py-3 px-1 rounded-xl font-sans text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                  selectedMode === mode
                    ? 'bg-[#D1FF4D] text-black border-[#D1FF4D]'
                    : 'bg-black border-stone-800 text-zinc-450 hover:text-white hover:border-[#D1FF4D]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Set Session Duration presets */}
        <div className="space-y-2 text-left">
          <div className="flex justify-between items-center">
            <label className="text-zinc-500 font-sans text-[10px] font-black uppercase tracking-wider">Set Session Duration</label>
            <span className="font-sans text-xs font-black text-[#D1FF4D]">{durationMinutes} Minutes</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 45, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setDurationMinutes(mins);
                  setTimeLeft(mins * 60);
                  setIsPlaying(false);
                }}
                className={`py-2.5 rounded-xl font-mono text-xs font-bold border-2 transition-all cursor-pointer ${
                  durationMinutes === mins
                    ? 'bg-[#D1FF4D]/10 text-[#D1FF4D] border-[#D1FF4D]/35'
                    : 'bg-black border-stone-800 text-zinc-450 hover:text-white hover:border-[#D1FF4D]'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Ambient Sound OSC Synthesizer */}
        <div className="space-y-2 text-left">
          <label className="text-zinc-500 font-sans text-[10px] font-black uppercase tracking-wider block">Synthesized Background Noise</label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'none', label: 'Off', icon: VolumeX },
              { id: 'white', label: 'Sky Noise', icon: Moon },
              { id: 'rain', label: 'Rain OSC', icon: Trees },
              { id: 'synth', label: 'Cosmic', icon: Compass },
            ].map((sound) => (
              <button
                key={sound.id}
                onClick={() => toggleSynthesizerNoise(sound.id as NoiseType)}
                className={`py-2.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
                  noise === sound.id
                    ? 'bg-[#D1FF4D]/10 text-[#D1FF4D] border-[#D1FF4D]/35'
                    : 'bg-black border-stone-800 text-zinc-455 hover:text-white hover:border-[#D1FF4D]'
                }`}
              >
                <sound.icon size={13} className={noise === sound.id ? 'text-[#D1FF4D]' : ''} />
                <span className="text-[9px] font-sans font-black uppercase tracking-wider">{sound.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Countdown Timer Clock */}
        <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl py-6 px-4 flex flex-col items-center relative overflow-hidden">
          <p className="font-sans text-[10px] uppercase font-black tracking-widest text-[#D1FF4D] mb-1.5">Session Timer</p>
          <span className="font-sans text-5xl font-black text-white tracking-tighter uppercase italic" id="countdown-timer">
            {formatTimer(timeLeft)}
          </span>

          {/* Quick controls play/pause/reset */}
          <div className="flex items-center gap-4 mt-4 z-10">
            <button
              onClick={() => {
                setTimeLeft(durationMinutes * 60);
                setIsPlaying(false);
              }}
              className="w-10 h-10 rounded-full bg-black border-2 border-stone-800 flex items-center justify-center text-zinc-400 hover:text-[#D1FF4D] hover:border-[#D1FF4D] transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-13 h-13 rounded-full bg-[#D1FF4D]/10 border-2 border-[#D1FF4D]/30 flex items-center justify-center text-[#D1FF4D] hover:bg-[#D1FF4D]/25 hover:border-[#D1FF4D] transition-colors cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} className="stroke-[3]" /> : <Play size={18} className="stroke-[3]" />}
            </button>
          </div>
        </div>

        {/* Integrated Breathing Indicator Circle */}
        <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-5 flex items-center justify-between gap-4">
          <div className="flex flex-col text-left">
            <h4 className="font-sans text-xs font-black uppercase tracking-wide text-white">Flow Breathing Assistant</h4>
            <p className="font-sans text-[11px] text-zinc-450 mt-1 max-w-[190px]">Synchronize your breathing rate to align neural frequencies prior to focusing.</p>
            <span className="font-sans text-[10px] font-black uppercase text-[#D1FF4D] tracking-widest mt-2 block">
              {breathingStage === 'breathe-in' && '💨 Breathe In'}
              {breathingStage === 'hold' && '⏳ Hold'}
              {breathingStage === 'breathe-out' && '🌬️ Breathe Out'}
            </span>
          </div>

          {/* Expanding breathing dot helper */}
          <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center shrink-0 border-2 border-stone-800">
            <div 
              className={`rounded-full bg-[#D1FF4D] transition-all duration-1000 ${
                breathingStage === 'breathe-in' ? 'w-10 h-10 shadow-[0_0_15px_#D1FF4D]' :
                breathingStage === 'hold' ? 'w-8 h-8 opacity-80' :
                'w-4 h-4 opacity-55'
              }`}
            ></div>
          </div>
        </div>

      </div>

      {/* Primary Sticky bottom launch action */}
      <div className="pt-4 text-left">
        <button
          onClick={startActiveFocusedState}
          className="w-full bg-[#D1FF4D] text-black h-12 rounded-xl font-sans font-black text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_22px_rgba(209,255,77,0.22)] cursor-pointer"
        >
          <Zap size={15} fill="black" className="stroke-[3]" /> Start Flow & Engage Device Locks
        </button>
        <p className="text-[10px] font-sans text-zinc-500 text-center mt-2.5">
          🔒 Lock screen overlay holds Instagram, TikTok and Twitter inactive.
        </p>
      </div>

    </div>
  );
}
