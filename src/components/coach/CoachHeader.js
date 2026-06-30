"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Award, Calendar, Wallet, LogOut, User } from "lucide-react";

export default function CoachHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUser(data.user);
    });
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <div className="border-b border-zinc-800 bg-surface-elevated sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Identitas Brand Coach */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
          <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-micro font-mono text-zinc-500 block leading-none">INSTRUCTOR HUB</span>
            <h2 className="text-base font-black text-white font-display">Coach Strategy Console</h2>
          </div>
        </div>

        {/* Kontrol Navigasi & Profil (Kanan) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          
          <div className="flex bg-surface border border-zinc-800/80 p-1 rounded-lg w-full sm:w-auto overflow-x-auto scrollbar-none">
            <Link 
              href="/coach/schedule"
              className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap flex-1 sm:flex-none ${
                pathname.includes('/schedule') 
                  ? 'bg-surface-hover text-white border border-zinc-800 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${pathname.includes('/schedule') ? 'text-brand-emerald' : ''}`} />
              <span>SCHEDULE MATRIX</span>
            </Link>
            <Link 
              href="/coach/wallet"
              className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap flex-1 sm:flex-none ${
                pathname.includes('/wallet') 
                  ? 'bg-surface-hover text-white border border-zinc-800 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Wallet className={`w-3.5 h-3.5 ${pathname.includes('/wallet') ? 'text-brand-emerald' : ''}`} />
              <span>SALDO & WALLET</span>
            </Link>
          </div>

          {/* Sektor Profil & Logout */}
          <div className="flex items-center gap-3 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-zinc-800/80 pt-4 sm:pt-0 w-full sm:w-auto justify-between sm:justify-start">
            <Link href="/profile" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                <User className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="text-left">
                <span className="text-micro font-mono text-zinc-500 block leading-none uppercase">OFFICIAL COACH</span>
                <span className="text-xs font-bold text-white max-w-[120px] truncate block group-hover:text-emerald-400 transition-colors">
                  {currentUser?.user_metadata?.full_name || "Memuat..."}
                </span>
              </div>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="bg-red-950/20 hover:bg-red-900/60 border border-red-500/20 text-red-400 p-2 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center justify-center"
              title="Akhiri Sesi Mengajar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}