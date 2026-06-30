"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Shield, TrendingUp, Sliders, LogOut, User } from "lucide-react";

export default function SuperAdminHeader({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <div className="border-b border-zinc-800 bg-surface-elevated sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
        
        {/* Identitas Brand */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-center lg:justify-start">
          <div className="w-8 h-8 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-micro font-mono text-zinc-500 block leading-none">SUPER COMMAND SUITE</span>
            <h2 className="text-base font-black text-white font-display">Super Admin Console</h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Menu Navigasi dengan Active State */}
          <div className="flex bg-surface border border-zinc-800/80 p-1 rounded-lg w-full sm:w-auto overflow-x-auto scrollbar-none">
            <Link 
              href="/super-admin/verifications"
              className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap flex-1 sm:flex-none ${
                pathname.includes('/verifications') 
                  ? 'bg-surface-hover text-white border border-zinc-800 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Sliders className={`w-3.5 h-3.5 ${pathname.includes('/verifications') ? 'text-red-400' : ''}`} />
              <span>ONBOARDING QUEUE</span>
            </Link>
            <Link 
              href="/super-admin/audits"
              className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap flex-1 sm:flex-none ${
                pathname.includes('/audits') 
                  ? 'bg-surface-hover text-white border border-zinc-800 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <TrendingUp className={`w-3.5 h-3.5 ${pathname.includes('/audits') ? 'text-blue-400' : ''}`} />
              <span>GLOBAL LEDGER</span>
            </Link>
          </div>

          {/* Profil Admin & Tombol Keluar */}
          <div className="flex items-center gap-3 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-zinc-800/80 pt-4 sm:pt-0 w-full sm:w-auto justify-between sm:justify-start">
            <Link href="/profile" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-red-500/50 transition-colors">
                <User className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors" />
              </div>
              <div className="text-left">
                <span className="text-micro font-mono text-zinc-500 block leading-none">ROOT ACCESS</span>
                <span className="text-xs font-bold text-white max-w-[120px] truncate block group-hover:text-red-400 transition-colors">
                  {user?.user_metadata?.full_name || "Super Admin"}
                </span>
              </div>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="bg-red-950/20 hover:bg-red-900/60 border border-red-500/20 text-red-400 p-2 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center justify-center"
              title="Cabut Akses Root (Keluar)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}