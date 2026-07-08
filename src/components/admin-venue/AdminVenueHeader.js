"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Activity, BarChart4, ScanBarcode, Grid, LogOut, User } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminVenueHeader({ venueName = "Venue" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUser(data.user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <div className="border-b border-zinc-900 bg-zinc-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col xl:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-3 w-full xl:w-auto justify-center xl:justify-start">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500 block leading-none mb-1">PARTNER SUITE</span>
            <h2 className="text-base font-black text-white font-display truncate max-w-[200px] sm:max-w-md uppercase tracking-wide">
              {venueName} Command Center
            </h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="flex bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto scrollbar-none">
            <Link 
              href="/admin-venue/slots"
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all whitespace-nowrap flex-1 md:flex-none",
                pathname.includes('/slots') ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Grid className={cn("w-4 h-4", pathname.includes('/slots') && "text-brand-emerald")} />
              <span>SLOT MATRIX</span>
            </Link>
            <Link 
              href="/admin-venue/scan"
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all whitespace-nowrap flex-1 md:flex-none",
                pathname.includes('/scan') ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <ScanBarcode className={cn("w-4 h-4", pathname.includes('/scan') && "text-purple-400")} />
              <span>SCANNER GATE</span>
            </Link>
            <Link 
              href="/admin-venue/reports"
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all whitespace-nowrap flex-1 md:flex-none",
                pathname.includes('/reports') ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <BarChart4 className={cn("w-4 h-4", pathname.includes('/reports') && "text-amber-400")} />
              <span>REPORTS</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 w-full md:w-auto justify-between md:justify-start">
            <Link href="/profile" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-brand-emerald transition-colors">
                <User className="w-4 h-4 text-zinc-500 group-hover:text-brand-emerald transition-colors" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 block leading-none uppercase mb-1">VENUE ADMIN</span>
                <span className="text-xs font-bold text-white max-w-[120px] truncate block group-hover:text-brand-emerald transition-colors">
                  {currentUser?.user_metadata?.full_name || "Memuat..."}
                </span>
              </div>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-500/30 text-zinc-500 hover:text-red-400 p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center"
              title="Akhiri Sesi Operasional"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}