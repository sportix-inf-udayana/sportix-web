// src/components/auth/RegisterForm.js
'use client';
import { useState, useTransition } from 'react';
import { registerAction } from '@/app/(auth)/_actions';
import { Loader2, User, Mail, Lock, AlertTriangle } from 'lucide-react';

export default function RegisterForm() {
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await registerAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md font-sans">
      {error && (
        <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg flex items-start gap-2 text-red-400 font-mono text-xs uppercase tracking-wide">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="name" className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Full Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-600">
            <User className="w-4 h-4" />
          </div>
          <input 
            id="name" 
            name="name" 
            type="text" 
            required 
            disabled={isPending}
            placeholder="John Doe"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-brand-emerald focus:outline-none transition-colors disabled:opacity-50 font-mono text-sm" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Email Identity</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-600">
            <Mail className="w-4 h-4" />
          </div>
          <input 
            id="email" 
            name="email" 
            type="email" 
            required 
            disabled={isPending}
            placeholder="user@sportix.app"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-brand-emerald focus:outline-none transition-colors disabled:opacity-50 font-mono text-sm" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="password" className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Cryptographic Key (Min. 6)</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-600">
            <Lock className="w-4 h-4" />
          </div>
          <input 
            id="password" 
            name="password" 
            type="password" 
            required 
            minLength={6}
            disabled={isPending}
            placeholder="••••••••"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-brand-emerald focus:outline-none transition-colors disabled:opacity-50 font-mono text-sm" 
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={isPending}
        className="w-full mt-2 bg-white hover:bg-zinc-200 text-black font-black py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer font-mono"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'INITIALIZE ACCOUNT'}
      </button>
    </form>
  );
}