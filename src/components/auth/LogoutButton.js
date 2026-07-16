// src/components/auth/LogoutButton.js
'use client';
import { useTransition } from 'react';
import { logoutAction } from '@/app/(auth)/_actions';
import { LogOut, Loader2 } from 'lucide-react';

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logoutAction();
    });
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isPending}
      className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
      aria-label="Logout"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
      {isPending ? 'TERMINATING SESSION...' : 'SECURE LOGOUT'}
    </button>
  );
}