import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, RefreshCw, Key, Image } from 'lucide-react';
import { authService, UserAccount } from '../lib/firebase';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

const PRESET_REGISTRATION_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
];

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  // Mode: 'login' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Input States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_REGISTRATION_AVATARS[0]);

  // View States
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorStr, setErrorStr] = useState('');
  const [successStr, setSuccessStr] = useState('');

  // 1. Submit Registration Form
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorStr('Please populate all credential parameters.');
      return;
    }
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setErrorStr('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorStr('Password must stand at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorStr('');
    setSuccessStr('');

    try {
      const createdUser = await authService.signUp(email, password, fullName, avatarUrl);
      setSuccessStr('Authentication Account Initiated successfully!');
      setTimeout(() => {
        onLoginSuccess(createdUser);
      }, 1000);
    } catch (err: any) {
      setErrorStr(err.message || 'Registration has failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Login Form
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorStr('Please provide both email and security key values.');
      return;
    }
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setErrorStr('Invalid email address format.');
      return;
    }

    setIsLoading(true);
    setErrorStr('');
    setSuccessStr('');

    try {
      const user = await authService.signIn(email, password);
      setSuccessStr('Security handshake validated!');
      setTimeout(() => {
        onLoginSuccess(user);
      }, 1000);
    } catch (err: any) {
      setErrorStr(err.message || 'Access authorization rejected.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Password Reset Form
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorStr('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    setErrorStr('');
    setSuccessStr('');

    try {
      const responseMsg = await authService.sendResetToken(email);
      setSuccessStr(responseMsg);
      // Automatically return to login area after dispatch
      setTimeout(() => {
        setAuthMode('login');
        setSuccessStr('');
      }, 3500);
    } catch (err: any) {
      setErrorStr(err.message || 'Failed to dispatch reset instructions.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Social Login Triggers
  const handleSocialTrigger = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    setErrorStr('');
    setSuccessStr('');

    try {
      const user = await authService.socialSignIn(provider);
      setSuccessStr(`Social sync via ${provider === 'google' ? 'Google' : 'Facebook'} established!`);
      setTimeout(() => {
        onLoginSuccess(user);
      }, 1000);
    } catch (err: any) {
      setErrorStr(err.message || 'Social handshake failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between px-6 pt-16 pb-8 bg-[#0a0a0c] overflow-y-auto text-left">
      
      {/* Brand Identity */}
      <div className="flex flex-col items-center text-center mt-2 shrink-0">
        <div className="w-12 h-12 rounded-full bg-[#D1FF4D] flex items-center justify-center border-4 border-black shadow-[0_0_20px_rgba(209,255,77,0.15)] mb-3">
          <div className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center relative">
            <div className="w-2.5 h-2.5 rounded-full border border-black"></div>
            <span className="absolute w-0.5 h-2 bg-black -top-0.5"></span>
            <span className="absolute w-2 h-0.5 bg-black -right-0.5"></span>
          </div>
        </div>
        
        <h2 className="font-sans font-black text-2xl tracking-tighter uppercase italic text-white">
          Mind <span className="text-[#D1FF4D]">Protector</span>
        </h2>
        <p className="font-sans text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-1 max-w-[280px]">
          {authMode === 'login' && 'Enter the Flow State'}
          {authMode === 'register' && 'Deploy Cognitive Protocols'}
          {authMode === 'forgot' && 'Reset Security Parameters'}
        </p>
      </div>

      {/* Main Authentication Box */}
      <div className="bg-[#121212] border-2 border-stone-800 rounded-3xl p-5 mt-4 flex flex-col relative overflow-hidden">
        
        {/* Toggle between Back Actions */}
        {authMode !== 'login' && (
          <button 
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorStr('');
              setSuccessStr('');
            }}
            className="flex items-center gap-1 text-zinc-500 hover:text-white text-[9px] font-sans font-black uppercase tracking-widest mb-3.5 cursor-pointer pb-2 border-b border-stone-850"
          >
            <ArrowLeft size={10} className="text-[#D1FF4D]" /> Return to login
          </button>
        )}

        {/* -------------------- FORGOT / RESET STATE -------------------- */}
        {authMode === 'forgot' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="flex flex-col space-y-1.5 text-left">
              <label className="text-zinc-400 font-sans text-[9px] font-black tracking-widest uppercase">Registered Work Email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-zinc-500" size={15} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-11 bg-black border-2 border-stone-800 focus:border-[#D1FF4D] text-white rounded-xl pl-11 pr-4 text-xs font-sans placeholder-zinc-700 transition-colors outline-none"
                  required
                />
              </div>
              <p className="text-[9px] text-zinc-500 leading-normal mt-1">
                We will dispatch a secure validation reset link. Submit query to synchronize.
              </p>
            </div>

            {/* Error and Success Indicators */}
            {errorStr && <p className="text-rose-400 text-xs text-center font-sans">{errorStr}</p>}
            {successStr && <p className="text-[#D1FF4D] text-xs text-center font-sans font-black uppercase">{successStr}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#D1FF4D] text-black h-11 font-sans font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_15px_rgba(209,255,77,0.1)] flex items-center justify-center cursor-pointer"
            >
              {isLoading ? <RefreshCw size={14} className="animate-spin text-black" /> : 'Dispatch Reset Email'}
            </button>
          </form>
        )}

        {/* -------------------- REGISTRATION / SIGN UP STATE -------------------- */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-left">
            
            {/* Full Name field */}
            <div className="flex flex-col space-y-1">
              <label className="text-zinc-500 font-sans text-[9px] font-black tracking-widest uppercase">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 text-zinc-500" size={15} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full h-10 bg-black border-2 border-stone-850 focus:border-[#D1FF4D] text-white rounded-xl pl-11 pr-4 text-xs font-sans placeholder-zinc-700 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Work Email field */}
            <div className="flex flex-col space-y-1">
              <label className="text-zinc-500 font-sans text-[9px] font-black tracking-widest uppercase">Work Email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-zinc-500" size={15} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-10 bg-black border-2 border-stone-850 focus:border-[#D1FF4D] text-white rounded-xl pl-11 pr-4 text-xs font-sans placeholder-zinc-700 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div className="flex flex-col space-y-1">
              <label className="text-zinc-500 font-sans text-[9px] font-black tracking-widest uppercase">Choose Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-zinc-500" size={15} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full h-10 bg-black border-2 border-stone-850 focus:border-[#D1FF4D] text-white rounded-xl pl-11 pr-11 text-xs font-sans placeholder-zinc-700 outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Avatar picker container */}
            <div className="space-y-1.5">
              <label className="text-zinc-500 font-sans text-[9px] font-black tracking-widest uppercase flex items-center gap-1">
                <Image size={10} /> Choose Avatar preset
              </label>
              <div className="flex gap-2">
                {PRESET_REGISTRATION_AVATARS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      avatarUrl === preset ? 'border-[#D1FF4D] scale-105 shadow-md' : 'border-stone-850'
                    }`}
                  >
                    <img src={preset} alt="preset avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Information loops of system security */}
            {errorStr && <p className="text-rose-400 text-xs text-center font-sans">{errorStr}</p>}
            {successStr && <p className="text-[#D1FF4D] text-xs text-center font-sans font-black uppercase">{successStr}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#D1FF4D] hover:bg-white text-black font-sans font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_15px_rgba(209,255,77,0.1)] flex items-center justify-center cursor-pointer mt-2"
            >
              {isLoading ? <RefreshCw size={14} className="animate-spin text-black" /> : 'Deploy Account'}
            </button>
          </form>
        )}

        {/* -------------------- STANDARD LOGIN STATE -------------------- */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Username/Email */}
            <div className="flex flex-col space-y-1 text-left">
              <label className="text-zinc-500 font-sans text-[9px] font-black tracking-widest uppercase">Work Email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-zinc-500" size={15} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-11 bg-black border-2 border-stone-800 focus:border-[#D1FF4D] text-white rounded-xl pl-11 pr-4 text-xs font-sans placeholder-zinc-700 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Encryption password key */}
            <div className="flex flex-col space-y-1 text-left">
              <div className="flex justify-between items-center">
                <label className="text-zinc-500 font-sans text-[9px] font-black tracking-widest uppercase">Encrpytion Key</label>
                <button 
                  type="button" 
                  onClick={() => {
                    setAuthMode('forgot');
                    setErrorStr('');
                    setSuccessStr('');
                  }}
                  className="text-[9px] font-sans font-black uppercase text-[#D1FF4D] hover:underline cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-zinc-500" size={15} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 bg-black border-2 border-stone-800 focus:border-[#D1FF4D] text-white rounded-xl pl-11 pr-11 text-xs font-sans placeholder-zinc-700 outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 pointer-events-auto"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Info feedback loops */}
            {errorStr && <p className="text-rose-400 text-xs text-center font-sans">{errorStr}</p>}
            {successStr && <p className="text-[#D1FF4D] text-xs text-center font-content font-black uppercase">{successStr}</p>}

            {/* Login validation triggers */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#D1FF4D] hover:bg-white text-black h-12 font-sans font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_15px_rgba(209,255,77,0.1)] flex items-center justify-center cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Initialize Session'
              )}
            </button>
          </form>
        )}

        {/* Social auth separator */}
        {authMode === 'login' && (
          <>
            <div className="relative flex py-3.5 items-center justify-center">
              <div className="flex-grow border-t border-stone-850"></div>
              <span className="flex-shrink mx-2 text-zinc-600 font-sans text-[8px] uppercase tracking-widest font-extrabold">Social Authentications</span>
              <div className="flex-grow border-t border-stone-850"></div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleSocialTrigger('google')}
                className="flex items-center justify-center gap-2 bg-black hover:bg-stone-900 border-2 border-stone-800 rounded-xl h-10 text-[9px] font-sans font-black uppercase text-white transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.564-1.88 4.59-6.887 4.59-4.329 0-7.859-3.583-7.859-8s3.53-8 7.859-8c2.464 0 4.114 1.056 5.057 1.956l3.24-3.111C18.283 1.571 15.549 0 12.24 0 5.58 0 0 5.373 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.793-.086-1.397-.189-1.925H12.24z"/>
                </svg>
                Google
              </button>
              <button
                onClick={() => handleSocialTrigger('facebook')}
                className="flex items-center justify-center gap-2 bg-black hover:bg-stone-900 border-2 border-stone-800 rounded-xl h-10 text-[9px] font-sans font-black uppercase text-white transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </>
        )}

        {/* Change Mode selector */}
        {authMode === 'login' ? (
          <button
            onClick={() => {
              setAuthMode('register');
              setErrorStr('');
              setSuccessStr('');
            }}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-[10px] font-sans font-medium text-center mt-4.5 cursor-pointer"
          >
            Don't have an account? <span className="text-[#D1FF4D] font-black uppercase hover:underline">Register spec</span>
          </button>
        ) : (
          authMode === 'register' && (
            <button
              onClick={() => {
                setAuthMode('login');
                setErrorStr('');
                setSuccessStr('');
              }}
              className="text-zinc-500 hover:text-zinc-300 transition-colors text-[10px] font-sans font-medium text-center mt-3 cursor-pointer"
            >
              Already registered? <span className="text-[#D1FF4D] font-black uppercase hover:underline">Login specs</span>
            </button>
          )
        )}
      </div>

      {/* Trust Footer */}
      <div className="flex items-center justify-center gap-2 mt-4 text-[10px] font-sans text-zinc-600 shrink-0">
        <div className="flex -space-x-1.5 opacity-55">
          <div className="w-4.5 h-4.5 rounded-full bg-stone-900 border border-black flex items-center justify-center text-[6px] font-bold text-[#D1FF4D]">F</div>
          <div className="w-4.5 h-4.5 rounded-full bg-stone-900 border border-black flex items-center justify-center text-[6px] font-bold text-zinc-400">L</div>
        </div>
        <span>Endorsed by Flow Laboratories</span>
      </div>
    </div>
  );
}
