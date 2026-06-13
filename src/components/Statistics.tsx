import React, { useState } from 'react';
import { Calendar, Award, RotateCcw, Clock, Zap, BookOpen, User, Flame, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { FocusSessionLog, WeeklyData } from '../types';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: WeeklyData;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#121212] border-2 border-stone-800 p-3 rounded-2xl shadow-xl border-l-[3px] border-l-[#D1FF4D]">
        <p className="font-sans text-[10px] font-black uppercase text-[#D1FF4D] tracking-wider mb-1">
          {data.day} Sessions
        </p>
        <p className="font-sans text-xs font-bold text-white flex items-center gap-1.5">
          <Clock size={11} className="text-[#D1FF4D]" />
          Focused: <span className="text-[#D1FF4D] font-mono font-black">{data.hours}h</span>
        </p>
        <p className="font-sans text-[10px] text-zinc-400 mt-1 flex items-center gap-1.5">
          <Zap size={11} className="text-zinc-500" />
          Sessions Count: <span className="text-white font-mono">{data.sessions}</span>
        </p>
      </div>
    );
  }
  return null;
};

interface StatisticsProps {
  logs: FocusSessionLog[];
  weeklyStats: WeeklyData[];
  onNavigateHome: () => void;
}

export default function Statistics({ logs, weeklyStats, onNavigateHome }: StatisticsProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const totalHoursFocus = logs.reduce((sum, item) => sum + item.durationMinutes, 0) / 60;
  const totalSessionsCount = logs.length;
  const completedCount = logs.filter(l => l.status === 'completed').length;
  const complianceRate = totalSessionsCount > 0 ? Math.round((completedCount / totalSessionsCount) * 100) : 0;

  // Render responsive Custom SVG Bar Chart
  const maxHours = Math.max(...weeklyStats.map(w => w.hours), 4);
  
  return (
    <div className="w-full h-full flex flex-col pt-16 pb-24 bg-[#0a0a0c] overflow-y-auto px-5">
      
      {/* Title block */}
      <div className="text-center pt-3 mb-5">
        <p className="font-sans text-[10px] uppercase font-black tracking-[0.2em] text-[#D1FF4D]">Analytics Suite</p>
        <h2 className="font-sans font-black text-2xl uppercase italic tracking-tighter text-white mt-1">Focus Metrics</h2>
      </div>

      {/* Grid of micro-stats badges */}
      <div className="grid grid-cols-3 gap-2.5">
        
        <div className="bg-[#121212] border-2 border-stone-800 rounded-2xl p-3 text-center">
          <Clock className="text-[#D1FF4D] mx-auto mb-1.5" size={16} />
          <span className="font-sans text-base font-black text-white leading-none block">{totalHoursFocus.toFixed(1)}h</span>
          <span className="text-[9px] font-sans font-black uppercase tracking-wider block mt-1 text-zinc-400">Total Focused</span>
        </div>

        <div className="bg-[#121212] border-2 border-stone-800 rounded-2xl p-3 text-center">
          <Zap className="text-[#D1FF4D] mx-auto mb-1.5" size={16} />
          <span className="font-sans text-base font-black text-white leading-none block">{totalSessionsCount}</span>
          <span className="text-[9px] font-sans font-black uppercase tracking-wider block mt-1 text-zinc-400">Sessions</span>
        </div>

        <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-3 text-center">
          <Award className="text-emerald-400 mx-auto mb-1.5" size={16} />
          <span className="font-sans text-base font-black text-white leading-none block">{complianceRate}%</span>
          <span className="text-[9px] font-sans font-black uppercase tracking-wider block mt-1 text-zinc-400">Goal Success</span>
        </div>

      </div>

      {/* Main Interactive Recharts Weekly Bar Chart */}
      <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-5 mt-5">
        <div className="flex justify-between items-center mb-1">
          <div className="text-left">
            <h4 className="font-sans text-xs font-black uppercase tracking-wide text-white">Weekly Focus Trends</h4>
            <p className="text-[10px] font-sans text-zinc-500">
              {selectedDay ? (
                <span>Filtering by <b className="text-[#D1FF4D] uppercase">{selectedDay}</b>. Tap bar again to clear filters.</span>
              ) : (
                "Tap bars to partition session logs"
              )}
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#D1FF4D] bg-[#D1FF4D]/5 px-2.5 py-1 rounded-md border border-[#D1FF4D]/10 font-bold flex items-center gap-1">
            <ArrowUpRight size={11} className="text-[#D1FF4D]" /> Avg: 4.8h/day
          </span>
        </div>

        {/* Dynamic Recharts Visual Container */}
        <div className="h-48 w-full mt-4 -ml-2 select-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={weeklyStats} 
              margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid stroke="#1c1c1f" vertical={false} strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: '900' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace', fontWeight: '700' }}
                tickFormatter={(val) => `${val}h`}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: '#161619', radius: 8 }} 
                animationDuration={200}
              />
              <Bar 
                dataKey="hours" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={32}
              >
                {weeklyStats.map((entry, index) => {
                  const isSelected = selectedDay === entry.day;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      cursor="pointer" 
                      fill={isSelected ? '#D1FF4D' : '#3f3f46'} 
                      onClick={() => setSelectedDay(selectedDay === entry.day ? null : entry.day)}
                      className="transition-colors duration-200 hover:fill-[#D1FF4D]/80"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Streak Alert banner */}
      <div className="bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-400 rounded-xl p-3.5 mt-4 text-left flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
          <Flame className="text-amber-400 fill-amber-400/10 animate-bounce" size={20} />
        </div>
        <div>
          <h4 className="font-sans text-xs font-black uppercase tracking-wide text-white">5 Day Cognitive Streak!</h4>
          <p className="font-sans text-[11px] text-zinc-400 leading-tight">Consistent sessions achieved. Your focus efficiency has surged by +14%.</p>
        </div>
      </div>

      {/* Historical Logs List */}
      <div className="mt-5 space-y-3">
        <div className="flex justify-between items-center px-1">
          <h4 className="font-sans text-xs font-black uppercase tracking-wider text-zinc-400">Session Activity History</h4>
          <span className="text-[10px] font-mono text-zinc-500">{logs.length} logged</span>
        </div>

        {logs.length === 0 ? (
          <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl py-8 text-center text-zinc-500 font-sans text-xs uppercase font-bold tracking-wider">
            No focus logs. Begin a flow session to record metrics.
          </div>
        ) : (
          <div className="space-y-2">
            {logs
              .filter(log => !selectedDay || log.date.includes(selectedDay))
              .map((log) => (
                <div key={log.id} className="bg-[#121212] border-2 border-stone-800 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0 border border-stone-800">
                      <Zap size={13} className="text-[#D1FF4D]" />
                    </div>
                    <div className="text-left">
                      <span className="font-sans text-[11px] font-black uppercase text-white block">{log.mode}</span>
                      <span className="text-[10px] font-sans text-zinc-400 block mt-0.5">{log.date}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#D1FF4D] block">{log.durationMinutes} mins</span>
                    <span className={`text-[9px] font-sans tracking-wide uppercase font-black block mt-0.5 ${
                      log.status === 'completed' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

    </div>
  );
}
