import React, { useState } from 'react';
import { 
  Menu, Bell, User, Zap, BarChart2, Shield, Plus, Heart, MessageSquare, 
  Sparkles, ArrowRight, Share2, Compass, Home, Play, Settings, X, LogIn 
} from 'lucide-react';
import { CommunityPost, AppLock } from '../types';

interface HomeDashboardProps {
  userName: string;
  userAvatarUrl?: string;
  onNavigate: (tab: 'home' | 'flow' | 'statistics' | 'limits' | 'settings' | 'lock' | 'profile') => void;
  appLocks: AppLock[];
  posts: CommunityPost[];
  setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
  onOpenQuickLog: () => void;
  onSignOut: () => void;
}

export default function HomeDashboard({
  userName,
  userAvatarUrl,
  onNavigate,
  appLocks,
  posts,
  setPosts,
  onOpenQuickLog,
  onSignOut
}: HomeDashboardProps) {
  const [showProTipModal, setShowProTipModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeLocksCount = appLocks.filter(a => a.isLocked).length;

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.likedByUser ? p.likes - 1 : p.likes + 1,
          likedByUser: !p.likedByUser
        };
      }
      return p;
    }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0c] relative pt-16 pb-20 overflow-y-auto">
      
      {/* Top App Bar & Profile Menu */}
      <header className="absolute top-0 left-0 w-full z-40 flex justify-between items-center px-5 h-16 bg-[#0a0a0c]/80 backdrop-blur-xl border-b-2 border-stone-800">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-zinc-400 hover:text-[#D1FF4D] transition-colors active:scale-95 cursor-pointer"
        >
          <Menu size={20} />
        </button>
        
        <button 
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full overflow-hidden border border-[#D1FF4D]/30 shrink-0">
            <img 
              alt="Avatar Profile" 
              src={userAvatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-sans text-xs font-black uppercase tracking-wider text-[#D1FF4D]">Mind Protector</span>
        </button>
        
        <button 
          onClick={() => onNavigate('settings')}
          className="text-zinc-400 hover:text-[#D1FF4D] transition-colors active:scale-95 cursor-pointer"
        >
          <Settings size={18} />
        </button>
      </header>

      {/* Slide-out Menu Indicator Drawer */}
      {isMenuOpen && (
        <div className="absolute inset-0 z-50 bg-black/84 backdrop-blur-md flex">
          <div className="w-[80%] bg-[#0e0e11] h-full p-6 border-r-2 border-stone-850 flex flex-col justify-between animate-slide-right">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b-2 border-stone-850">
                <span className="font-sans text-xs font-black uppercase tracking-wider text-[#D1FF4D]">Mind Protector Hub</span>
                <button onClick={() => setIsMenuOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="space-y-1">
                {[
                  { label: 'Home Dashboard', tab: 'home', icon: Home },
                  { label: 'Personal Profile Hub', tab: 'profile', icon: User },
                  { label: 'Start Flow State', tab: 'flow', icon: Zap },
                  { label: 'App Limits Filters', tab: 'limits', icon: Shield },
                  { label: 'Visual Statistics', tab: 'statistics', icon: BarChart2 },
                  { label: 'Device Locks Simulation', tab: 'lock', icon: Compass },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                        onNavigate(item.tab as any);
                        setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-black text-[11px] font-sans font-black uppercase tracking-wider text-zinc-350 hover:text-[#D1FF4D] transition-all text-left cursor-pointer"
                  >
                    <item.icon size={15} className="text-[#D1FF4D]" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

             {/* Logout Row */}
            <div className="pt-4 border-t-2 border-stone-850 space-y-4">
              <div 
                onClick={() => {
                  onNavigate('profile');
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-2 cursor-pointer hover:opacity-85 transition-opacity"
              >
                <img
                  className="w-10 h-10 rounded-full object-cover border border-[#D1FF4D]/35"
                  src={userAvatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt="Avatar"
                />
                <div>
                  <h4 className="font-sans text-xs font-black uppercase text-white leading-tight">{userName}</h4>
                  <p className="text-[9px] font-sans text-[#D1FF4D] font-black tracking-widest uppercase">PREMIUM ACTIVE</p>
                </div>
              </div>
              <button
                onClick={onSignOut}
                className="w-full flex items-center justify-center gap-2 bg-black border-2 border-stone-850 text-rose-400 rounded-xl py-2.5 text-[10px] font-sans font-black uppercase hover:bg-rose-950/20 hover:border-rose-900/40 transition-colors cursor-pointer"
              >
                <LogIn size={13} /> Sign Out Configuration
              </button>
            </div>
          </div>
          {/* Dismiss Back-area */}
          <div className="flex-1" onClick={() => setIsMenuOpen(false)}></div>
        </div>
      )}

      {/* Banner / Morning Greeting */}
      <div className="px-5 pt-5 pb-1 text-left">
        <p className="font-sans text-[10px] uppercase font-black tracking-[0.2em] text-[#D1FF4D]">
          Good Morning, {userName}
        </p>
        <h2 className="font-sans font-black text-3xl text-white tracking-tighter uppercase italic mt-1 leading-none">
          Ready to find your <span className="text-[#D1FF4D] underline underline-offset-4 decoration-stone-800">flow</span>?
        </h2>
      </div>

      {/* Central Progress Card */}
      <div className="px-5 mt-4">
        <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-5.5 flex flex-col relative overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.4)]">
          
          {/* Progress Circular visual */}
          <div className="flex items-center gap-5 justify-between">
            <div className="relative w-22 h-22 flex items-center justify-center shrink-0">
              {/* SVG circular dial structure */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="44"
                  cy="44"
                  r="37"
                  className="stroke-stone-900"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="44"
                  cy="44"
                  r="37"
                  className="stroke-[#D1FF4D] transition-all duration-1000"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 37}`}
                  strokeDashoffset={`${2 * Math.PI * 37 * (1 - 0.75)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-sans font-black text-white text-lg leading-none">75%</span>
                <span className="font-sans text-[8px] text-[rgba(255,255,255,0.4)] uppercase tracking-wide mt-0.5 font-bold">Daily Goal</span>
              </div>
            </div>

            {/* Support copy */}
            <div className="flex flex-col space-y-1.5 flex-1 text-left">
              <h4 className="font-sans text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Today's Progress</h4>
              <p className="font-sans text-[11px] text-[rgba(255,255,255,0.65)] leading-relaxed">
                You've logged 4.5 hours of deep work today. Just 1.5 more to reach your peak performance target.
              </p>
            </div>
          </div>

          {/* Action stats metrics row */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-stone-850">
            <span className="text-[10px] font-sans font-black uppercase text-[#D1FF4D] px-3 py-1 rounded-full bg-[#D1FF4D]/10 border border-[#D1FF4D]/25 flex items-center gap-1.5 shadow-[0_2px_10px_rgba(209,255,77,0.05)]">
              <Sparkles size={11} className="animate-pulse text-[#D1FF4D]" /> 3 Sessions Complete
            </span>
            <span className="text-[10px] font-sans font-black uppercase text-white px-3 py-1 rounded-full bg-black border border-stone-800 flex items-center gap-1.5">
              Top focus: UI Design
            </span>
          </div>

          <div className="absolute -right-16 -top-16 w-32 h-32 bg-[#D1FF4D]/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </div>

      {/* Interactive Navigation Rows (Start Flow, Statistics, Limits) */}
      <div className="px-5 mt-6 space-y-3">
        
        {/* Card 1: Start Flow State */}
        <div 
          onClick={() => onNavigate('flow')}
          className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-4.5 flex items-center gap-4 cursor-pointer hover:border-[#D1FF4D] transition-all group active:scale-[0.99]"
        >
          <div className="w-11 h-11 rounded-xl bg-black border border-stone-850 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-[#D1FF4D] group-hover:scale-110 transition-transform fill-[#D1FF4D]/10" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <h4 className="font-sans text-[13px] font-black uppercase text-white tracking-wide leading-tight">Start Flow State</h4>
            <p className="font-sans text-[11px] text-zinc-400 truncate mt-1">Instant neuro-optimized environment setup.</p>
          </div>
          <ArrowRight size={14} className="text-zinc-600 group-hover:text-white transition-colors translate-x-0 group-hover:translate-x-1" />
        </div>

        {/* Card 2: View Statistics */}
        <div 
          onClick={() => onNavigate('statistics')}
          className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-4.5 flex items-center gap-4 cursor-pointer hover:border-[#D1FF4D] transition-all group active:scale-[0.99]"
        >
          <div className="w-11 h-11 rounded-xl bg-black border border-stone-850 flex items-center justify-center shrink-0">
            <BarChart2 size={20} className="text-[#D1FF4D] group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <h4 className="font-sans text-[13px] font-black uppercase text-white tracking-wide leading-tight">View Statistics</h4>
            <p className="font-sans text-[11px] text-zinc-400 truncate mt-1">Analyze your weekly focus trends and habits.</p>
          </div>
          <ArrowRight size={14} className="text-zinc-600 group-hover:text-white transition-colors translate-x-0 group-hover:translate-x-1" />
        </div>

        {/* Card 3: App Limits */}
        <div 
          onClick={() => onNavigate('limits')}
          className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-4.5 flex items-center gap-4 cursor-pointer hover:border-[#D1FF4D] transition-all group active:scale-[0.99]"
        >
          <div className="w-11 h-11 rounded-xl bg-black border border-stone-850 flex items-center justify-center shrink-0">
            <Shield size={20} className="text-[#D1FF4D] group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <h4 className="font-sans text-[13px] font-black uppercase text-white tracking-wide leading-tight">App Limits</h4>
            <p className="font-sans text-[11px] text-zinc-400 truncate mt-1">
              {activeLocksCount} filters actively silences social networks.
            </p>
          </div>
          <ArrowRight size={14} className="text-zinc-600 group-hover:text-white transition-colors translate-x-0 group-hover:translate-x-1" />
        </div>

      </div>

      {/* Featured Pro-tip Card (Ultradian Rhythm) */}
      <div className="px-5 mt-6">
        <div 
          onClick={() => setShowProTipModal(true)}
          className="bg-[#121212] border-2 border-stone-800 rounded-3xl overflow-hidden cursor-pointer hover:border-[#D1FF4D] transition-all group relative flex flex-col active:scale-[0.99]"
        >
          {/* Cybernetic header graphic layout */}
          <div className="h-28 w-full bg-[#131b26] relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            
            {/* Visual simulated cyber planet glow */}
            <div className="absolute w-36 h-36 rounded-full border border-sky-400/20 flex items-center justify-center animate-spin" style={{ animationDuration: '30s' }}>
              <div className="w-20 h-20 rounded-full border border-sky-400/30"></div>
            </div>
            
            {/* Pro Badge */}
            <span className="absolute top-3 left-3 bg-[#D1FF4D] text-black font-sans text-[9px] font-black px-2.5 py-1 tracking-wider uppercase z-20 shadow-md">
              PRO TIP
            </span>

            {/* Glowing orb center */}
            <div className="w-8 h-8 rounded-full bg-[#D1FF4D]/10 border border-[#D1FF4D]/40 glow-pulse z-20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#D1FF4D]"></div>
            </div>
          </div>

          <div className="p-4 bg-black space-y-2 text-left">
            <h4 className="font-sans text-xs font-black uppercase tracking-wide text-white">The 90-Minute Rhythm</h4>
            <p className="font-sans text-[11px] text-zinc-400 leading-relaxed text-left">
              Research shows that deep work is most effective in 90-minute ultradian cycles. Mind Protector's "Auto-Flow" feature can now sync with your circadian rhythm.
            </p>
            <div className="flex items-center gap-1 text-[10px] font-sans font-black uppercase text-[#D1FF4D] pt-1">
              <span>Learn more</span>
              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Community Insights list */}
      <div className="px-5 mt-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-sans text-[11px] font-black text-[#e3e2e7] tracking-wider uppercase flex items-center gap-1.5">
            <Compass size={12} className="text-[#D1FF4D]" /> Community Insights
          </h4>
          <span className="font-sans text-[9px] text-[#D1FF4D] uppercase font-black tracking-widest">Sync Active</span>
        </div>

        <div className="space-y-2.5">
          {posts.map((post) => (
            <div key={post.id} className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-4 flex flex-col text-left">
              <div className="flex items-center gap-3">
                <img 
                  src={post.avatarUrl} 
                  alt={post.username} 
                  className="w-8 h-8 rounded-full border border-[#D1FF4D]/20 object-cover" 
                />
                <div className="min-w-0 text-left">
                  <h5 className="font-sans text-[11px] font-black uppercase text-white tracking-wide truncate">{post.username}</h5>
                  <p className="font-sans text-[9px] font-bold text-[#D1FF4D] tracking-wide truncate uppercase">{post.userTitle}</p>
                </div>
              </div>

              <p className="font-sans text-[11px] text-zinc-350 italic mt-2.5 leading-relaxed bg-black/60 p-2.5 rounded-xl border border-stone-850">
                "{post.text}"
              </p>

              {/* Like / reply section */}
              <div className="flex items-center justify-between mt-3 text-[9px] font-sans font-black uppercase text-zinc-500 pt-1.5">
                <button 
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-800 transition-all cursor-pointer ${
                    post.likedByUser 
                      ? 'text-[#D1FF4D] bg-[#D1FF4D]/5 border-[#D1FF4D]/30' 
                      : 'hover:text-white hover:border-[#D1FF4D]'
                  }`}
                >
                  <Heart size={10} className={post.likedByUser ? 'fill-[#D1FF4D] text-[#D1FF4D]' : ''} /> {post.likes}
                </button>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={10} /> {post.repliesCount} replies
                  </span>
                  <span>{post.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Discussion feed details expander */}
          <button 
            onClick={() => onNavigate('statistics')}
            className="w-full h-11 font-sans text-[10px] font-black uppercase tracking-wider text-zinc-400 border-2 border-stone-800 hover:border-[#D1FF4D] hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            View All Discussions
          </button>
        </div>
      </div>

      {/* Floating Action Button (Manual Log log overlay triggers) */}
      <button 
        onClick={onOpenQuickLog}
        className="absolute bottom-24 right-5 w-12 h-12 bg-[#D1FF4D] text-black border-2 border-black rounded-full flex items-center justify-center shadow-[0_6px_22px_rgba(209,255,77,0.3)] hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer"
        title="Quick Log Log"
      >
        <Plus size={20} className="stroke-[3]" />
      </button>

      {/* Pro Tip Detail Slide Modal */}
      {showProTipModal && (
        <div className="absolute inset-0 z-50 bg-[#070709]/95 backdrop-blur-xl p-6 flex flex-col justify-between animate-fade-in">
          <div className="space-y-6 text-left">
            <div className="flex justify-between items-center pb-3 border-b-2 border-stone-800">
              <span className="font-sans text-xs font-black text-[#D1FF4D] tracking-widest uppercase">Research Insights</span>
              <button onClick={() => setShowProTipModal(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-left">
              <h3 className="font-sans text-xl font-black text-white leading-tight uppercase italic tracking-tighter">The 90-Minute Rhythm</h3>
              <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                The human brain can only dwell in high-intensity focal states for approximately **90 minutes** before requiring dynamic recovery. Our physical systems operate on "ultradian rhythms."
              </p>

              {/* Graphic Representation */}
              <div className="bg-black p-4 rounded-3xl border-2 border-stone-800 space-y-3.5">
                <h4 className="text-[9px] font-sans font-black text-[#D1FF4D] uppercase tracking-widest">Session Structure Plan</h4>
                <div className="flex items-center justify-between text-center gap-2">
                  <div className="flex-1 p-2 bg-stone-900 rounded-lg border border-stone-800">
                    <p className="text-[10px] font-mono font-extrabold text-white">90 mins</p>
                    <p className="text-[8px] font-sans text-zinc-400 mt-1 uppercase font-bold">Deep Work</p>
                  </div>
                  <div className="text-zinc-500 font-bold text-xs">→</div>
                  <div className="flex-1 p-2 bg-[#D1FF4D]/5 rounded-lg border border-[#D1FF4D]/20">
                    <p className="text-[10px] font-mono font-extrabold text-[#D1FF4D]">20 mins</p>
                    <p className="text-[8px] font-sans text-zinc-400 mt-1 uppercase font-bold">Recovery</p>
                  </div>
                  <div className="text-zinc-500 font-bold text-xs">→</div>
                  <div className="flex-1 p-2 bg-stone-900 rounded-lg border border-stone-800">
                    <p className="text-[10px] font-mono font-extrabold text-white">Repeat</p>
                    <p className="text-[8px] font-sans text-zinc-400 mt-1 uppercase font-bold">Sprints</p>
                  </div>
                </div>
              </div>

              <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                Using Mind Protector triggers automatic countdown indicators at 90 minutes, recommending structured stretches or deep breaths before launching the next block.
              </p>
            </div>
          </div>

          <button 
            onClick={() => {
              setShowProTipModal(false);
              onNavigate('flow');
            }}
            className="w-full h-12 bg-[#D1FF4D] text-black font-sans font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white active:scale-95 transition-all text-center cursor-pointer"
          >
            Launch Active 90-Min Session
          </button>
        </div>
      )}

    </div>
  );
}
