import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Camera, Clock, Star, Trash2, Plus, Check, ArrowLeft, 
  Sparkles, Save, ShieldCheck, Heart, AlertCircle, RefreshCw 
} from 'lucide-react';
import { authService, dbService, UserAccount, SavedItem } from '../lib/firebase';
import { FocusSessionLog } from '../types';

interface UserProfileSectionProps {
  currentUser: UserAccount;
  onProfileUpdated: (updatedUser: UserAccount) => void;
  onBack: () => void;
}

// Preset visual avatars and names that look incredibly high-tech and sleek
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
];

export default function UserProfileSection({
  currentUser,
  onProfileUpdated,
  onBack
}: UserProfileSectionProps) {
  // Direct state handlers loaded from currentUser
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || PRESET_AVATARS[0]);
  const [cognitiveGoal, setCognitiveGoal] = useState(currentUser.cognitiveFocusGoal || '4.5h/day');
  const [marketingPreference, setMarketingPreference] = useState(!!currentUser.marketingPreference);

  // Form states
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Custom Preset selection
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Recent logs list
  const [recentLogs, setRecentLogs] = useState<FocusSessionLog[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Saved item editing
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [newBookmarkType, setNewBookmarkType] = useState('Audio Preset');
  const [showAddBookmark, setShowAddBookmark] = useState(false);

  // Load activity logs and saved items
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoadingData(true);
      try {
        const fetchedLogs = await dbService.fetchLogs(currentUser.uid);
        const fetchedSaved = await dbService.fetchSavedItems(currentUser.uid);
        
        // Take up to 4 recent logs
        setRecentLogs(fetchedLogs.slice(0, 4));
        setSavedItems(fetchedSaved);
      } catch (err) {
        console.error("Could not fetch user statistics: ", err);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadUserData();
  }, [currentUser]);

  // Handle Save profile update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty.' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const updated = await authService.updateProfile(
        currentUser.uid,
        name,
        email,
        avatarUrl,
        cognitiveGoal,
        marketingPreference
      );
      onProfileUpdated(updated);
      setMessage({ type: 'success', text: 'Profile changes successfully synchronized!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'System sync failure.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Add saved item
  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookmarkTitle.trim()) return;

    try {
      const createdItem = await dbService.addSavedItem(
        currentUser.uid,
        newBookmarkTitle,
        newBookmarkType,
        'Cognitive Flow'
      );
      setSavedItems(prev => [createdItem, ...prev]);
      setNewBookmarkTitle('');
      setShowAddBookmark(false);
      setMessage({ type: 'success', text: 'New saved item added!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Saved item sync failed.' });
    }
  };

  // Delete saved item
  const handleDeleteBookmark = async (itemId: string) => {
    try {
      await dbService.deleteSavedItem(currentUser.uid, itemId);
      setSavedItems(prev => prev.filter(item => item.id !== itemId));
      setMessage({ type: 'success', text: 'Item removed from saved.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to delete saved item.' });
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0c] pt-16 pb-20 overflow-y-auto text-left relative">
      
      {/* Header Sub Banner bar */}
      <header className="absolute top-0 left-0 w-full z-40 flex justify-between items-center px-4 h-16 bg-[#0a0a0c]/90 backdrop-blur-md border-b-2 border-stone-850">
        <button 
          onClick={onBack}
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-sans font-black uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft size={16} className="text-[#D1FF4D]" />
          Back
        </button>
        <span className="font-sans text-xs font-black uppercase tracking-widest text-[#D1FF4D]">Profile HUB</span>
        <div className="w-16"></div> {/* Offset balance */}
      </header>

      {/* Profile Visual Identity Card */}
      <div className="px-5 mt-4 space-y-4">
        
        <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-5 flex flex-col items-center text-center relative overflow-hidden shadow-xl">
          
          {/* Main Avatar profile container */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-stone-850 shadow-inner">
              <img 
                src={avatarUrl} 
                alt="Profile Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Camera Overlay toggler */}
            <button 
              onClick={() => setShowAvatarSelector(!showAvatarSelector)}
              className="absolute -bottom-1 -right-1 bg-[#D1FF4D] text-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-black hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
              title="Change Picture"
            >
              <Camera size={13} className="stroke-[2.5]" />
            </button>
          </div>

          {/* Preset avatar select block */}
          {showAvatarSelector && (
            <div className="mt-4 p-3 bg-black border-2 border-stone-850 rounded-2xl w-full animate-fade-in">
              <p className="text-[10px] font-sans font-black uppercase text-[#D1FF4D] tracking-wider mb-2.5">Select Profile Preset Photo</p>
              <div className="flex gap-2 justify-center">
                {PRESET_AVATARS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setAvatarUrl(p);
                      setShowAvatarSelector(false);
                    }}
                    className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      avatarUrl === p ? 'border-[#D1FF4D] scale-105' : 'border-stone-800 hover:border-zinc-550'
                    }`}
                  >
                    <img src={p} className="w-full h-full object-cover" alt="preset" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User detail lines */}
          <div className="mt-3.5 text-center">
            <h3 className="font-sans font-black text-white text-base uppercase leading-tight">{name || 'Alex'}</h3>
            <p className="text-[10px] font-mono text-zinc-500 font-bold mt-1 tracking-wide">{email || 'alex@domain.com'}</p>
            <span className="inline-block mt-2.5 bg-black border border-stone-850 text-[9px] font-sans font-black uppercase text-[#D1FF4D] px-3 py-1 rounded-full">
              Joined {currentUser.joinedDate || 'Jun 2026'}
            </span>
          </div>

          <div className="absolute -left-12 -bottom-12 w-24 h-24 bg-[#D1FF4D]/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Global state notification triggers */}
        {message && (
          <div className={`p-4 rounded-2xl flex items-start gap-3 border text-xs font-sans ${
            message.type === 'success' 
              ? 'bg-[#D1FF4D]/5 border-[#D1FF4D]/35 text-[#D1FF4D]' 
              : 'bg-rose-950/20 border-rose-900/40 text-rose-350'
          }`}>
            {message.type === 'success' ? <ShieldCheck size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Edit Parameters Form Section */}
        <form onSubmit={handleSaveProfile} className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-5 space-y-4">
          <h4 className="font-sans text-[11px] font-black text-[#e3e2e7] tracking-wider uppercase flex items-center gap-1.5 border-b border-stone-850 pb-2">
            <User size={13} className="text-[#D1FF4D]" /> Modify Profile Specs
          </h4>

          {/* Full Name field */}
          <div className="flex flex-col space-y-1">
            <label className="text-zinc-500 font-sans text-[9px] font-black uppercase tracking-widest">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 bg-black border-2 border-stone-850 focus:border-[#D1FF4D] text-white rounded-xl px-3 text-xs font-sans outline-none transition-colors"
              placeholder="Your full name"
            />
          </div>

          {/* Work Email field */}
          <div className="flex flex-col space-y-1">
            <label className="text-zinc-500 font-sans text-[9px] font-black uppercase tracking-widest">Work Email (Authenticated)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 bg-black border-2 border-stone-850 focus:border-[#D1FF4D] text-white rounded-xl px-3 text-xs font-sans outline-none transition-colors"
              placeholder="name@company.com"
            />
          </div>

          {/* Target custom limits */}
          <div className="flex flex-col space-y-1">
            <label className="text-zinc-500 font-sans text-[9px] font-black uppercase tracking-widest">Cognitive Focus Goal</label>
            <select
              value={cognitiveGoal}
              onChange={(e) => setCognitiveGoal(e.target.value)}
              className="w-full h-10 bg-black border-2 border-stone-850 focus:border-[#D1FF4D] text-white rounded-xl px-2 text-xs font-sans outline-none appearance-none"
            >
              <option value="3.0h/day">3.0 Hours / Day (Normal)</option>
              <option value="4.5h/day">4.5 Hours / Day (Flow Peak)</option>
              <option value="6.0h/day">6.0 Hours / Day (Super Sprint)</option>
            </select>
          </div>

          {/* Marketing highlight specifications toggle ticker */}
          <div className="flex items-center justify-between pt-2.5">
            <div className="text-left select-none">
              <span className="font-sans text-[11px] font-black uppercase text-white block">Email Dispatch</span>
              <span className="text-[9px] text-zinc-400 block mt-0.5">Recaps, streak analytics & flow report bulletins</span>
            </div>
            <button
              type="button"
              onClick={() => setMarketingPreference(!marketingPreference)}
              className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all cursor-pointer ${
                marketingPreference 
                  ? 'bg-[#D1FF4D] border-[#D1FF4D]' 
                  : 'border-stone-800 hover:border-stone-700'
              }`}
            >
              {marketingPreference && <Check size={11} className="text-black stroke-[4]" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-11 bg-[#D1FF4D] hover:bg-white text-black font-sans font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_15px_rgba(209,255,77,0.1)] flex items-center justify-center gap-1.5 cursor-pointer mt-4"
          >
            {isSaving ? (
              <RefreshCw size={13} className="animate-spin text-black" />
            ) : (
              <>
                <Save size={13} />
                Save Profile Parameters
              </>
            )}
          </button>
        </form>

        {/* BOOKMARKED / SAVED ITEMS */}
        <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-stone-850 pb-2">
            <h4 className="font-sans text-[11px] font-black text-[#e3e2e7] tracking-wider uppercase flex items-center gap-1.5">
              <Star size={13} className="text-[#D1FF4D] fill-[#D1FF4D]/10" /> Bookmarks ({savedItems.length})
            </h4>
            
            <button
              onClick={() => setShowAddBookmark(!showAddBookmark)}
              className="text-[9px] font-black uppercase text-[#D1FF4D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus size={10} /> Add Saved
            </button>
          </div>

          {showAddBookmark && (
            <form onSubmit={handleAddBookmark} className="bg-black p-3.5 border border-stone-850 rounded-2xl space-y-3 animate-fade-in text-left">
              <div className="flex flex-col space-y-1">
                <label className="text-[8px] font-sans font-black uppercase text-zinc-500">Bookmark Title</label>
                <input
                  type="text"
                  value={newBookmarkTitle}
                  onChange={(e) => setNewBookmarkTitle(e.target.value)}
                  placeholder="e.g. Brain Wave Alpha Audio, Daily Log"
                  className="w-full h-8 bg-[#121212] border border-stone-800 rounded-lg px-2 text-xs text-white placeholder-zinc-700 outline-none"
                  required
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={newBookmarkType}
                  onChange={(e) => setNewBookmarkType(e.target.value)}
                  className="flex-1 h-8 bg-[#121212] border border-stone-800 rounded-lg px-1.5 text-[10px] text-zinc-400 outline-none"
                >
                  <option value="Audio Preset">Audio Preset</option>
                  <option value="Flow State Target">Flow State Limit</option>
                  <option value="Discussions">Discuss Post</option>
                </select>
                <button
                  type="submit"
                  className="bg-[#D1FF4D] text-black h-8 px-4 text-[10px] font-sans font-black uppercase rounded-lg cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          {isLoadingData ? (
            <div className="py-4 text-center text-zinc-550 flex items-center justify-center gap-2">
              <RefreshCw size={12} className="animate-spin text-[#D1FF4D]" />
              <span className="text-[10px] font-sans font-black uppercase">Retrieving cloud bookmarks...</span>
            </div>
          ) : savedItems.length === 0 ? (
            <div className="py-5 text-center bg-black/40 border border-dashed border-stone-850 rounded-2xl text-zinc-650">
              <p className="text-[10px] font-sans font-black uppercase tracking-wide">No bookmarks indexed.</p>
              <p className="text-[9px] font-sans text-zinc-400 mt-1">Add items to view them here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedItems.map(item => (
                <div key={item.id} className="bg-black/60 border border-stone-850 p-3 rounded-2xl flex items-center justify-between gap-3 text-left">
                  <div className="min-w-0">
                    <span className="text-[8px] font-mono uppercase bg-[#D1FF4D]/10 text-[#D1FF4D] px-1.5 py-0.5 rounded border border-[#D1FF4D]/20">
                      {item.type}
                    </span>
                    <h5 className="font-sans text-[11px] font-bold text-white truncate mt-2">{item.title}</h5>
                    <span className="text-[8px] text-zinc-600 block mt-0.5">Saved: {item.createdAt}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteBookmark(item.id)}
                    className="text-zinc-600 hover:text-rose-400 transition-colors p-2 cursor-pointer shrink-0"
                    title="Remove Bookmark"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT ACTIVITY SUMMARY */}
        <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-5 space-y-4">
          <h4 className="font-sans text-[11px] font-black text-[#e3e2e7] tracking-wider uppercase flex items-center gap-1.5 border-b border-stone-850 pb-2">
            <Clock size={13} className="text-[#D1FF4D]" /> Recent focus logs ({recentLogs.length})
          </h4>

          {isLoadingData ? (
            <div className="py-4 text-center text-zinc-550 flex items-center justify-center gap-2">
              <RefreshCw size={12} className="animate-spin text-[#D1FF4D]" />
              <span className="text-[10px] font-sans font-black uppercase">Fetching activity stream...</span>
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="py-5 text-center bg-black/40 border border-dashed border-stone-850 rounded-2xl text-zinc-650">
              <p className="text-[10px] font-sans font-black uppercase tracking-wide">No activities logged yet</p>
              <p className="text-[9px] font-sans text-zinc-400 mt-1">Logs populate here as you complete work sprints.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentLogs.map(log => (
                <div key={log.id} className="bg-black/40 border border-stone-850 p-3 rounded-2xl flex items-center justify-between text-left">
                  <div className="space-y-1">
                    <span className="text-[8px] font-sans font-black uppercase px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-zinc-400">
                      {log.mode}
                    </span>
                    <h5 className="font-sans text-xs font-black uppercase tracking-tight text-white mt-1.5">{log.category}</h5>
                    <span className="text-[8px] font-mono text-zinc-500 block">{log.date}</span>
                  </div>
                  <div className="text-right flex flex-col justify-between h-full">
                    <span className="text-xs font-mono font-black text-[#D1FF4D]">{log.durationMinutes}m</span>
                    <span className="text-[8px] font-sans font-black uppercase text-emerald-400 mt-1">SUCCESS</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
