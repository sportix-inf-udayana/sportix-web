"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, TrendingUp, Sliders, LogOut, User } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getSupabase } from "@/lib/supabase";

const cn = (...inputs) => twMerge(clsx(inputs));

export default function SuperAdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const supabase = getSupabase();

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (isMounted && data?.user) setCurrentUser(data.user);
    });
    return () => { isMounted = false; };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <div className="border-b border-zinc-900 bg-zinc-950 sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-3 w-full lg:w-auto justify-center lg:justify-start">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 block leading-none mb-1 uppercase">SUPER COMMAND SUITE</span>
            <h2 className="text-base font-black text-white font-display uppercase tracking-wide">Super Admin Console</h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="flex bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-none">
            <Link 
              href="/super-admin/verifications"
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all whitespace-nowrap flex-1 sm:flex-none",
                pathname.includes('/verifications') ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Sliders className={cn("w-4 h-4", pathname.includes('/verifications') && "text-red-400")} />
              <span>ONBOARDING QUEUE</span>
            </Link>
            <Link 
              href="/super-admin/audits"
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all whitespace-nowrap flex-1 sm:flex-none",
                pathname.includes('/audits') ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <TrendingUp className={cn("w-4 h-4", pathname.includes('/audits') && "text-red-400")} />
              <span>GLOBAL LEDGER</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-zinc-800 pt-4 sm:pt-0 w-full sm:w-auto justify-between sm:justify-start">
            <Link href="/profile" className="flex items-center gap-3 group cursor-pointer px-3 py-2 rounded-lg hover:bg-zinc-900 transition-colors">
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center group-hover:border-red-500 transition-colors">
                <User className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 block leading-none uppercase mb-1">ROOT ACCESS</span>
                <span className="text-xs font-bold text-white max-w-[110px] truncate block group-hover:text-red-400 transition-colors">
                  {currentUser?.user_metadata?.full_name || "Super Admin"}
                </span>
              </div>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-500/50 text-zinc-400 hover:text-red-400 p-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center shadow-sm"
              title="Cabut Akses Root"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}