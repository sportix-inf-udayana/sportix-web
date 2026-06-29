"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Activity, BarChart4, ScanBarcode, Grid, LogOut, User } from "lucide-react";

export default function AdminVenueHeader({ venueName = "Venue" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    // Tarik session secara mandiri agar tidak bergantung pada props dari layout
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUser(data.user);
    });
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="border-b border-zinc-800 bg-surface-elevated sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col xl:flex-row justify-between items-center gap-4">
        
        {/* Identitas Sektor Kiri */}
        <div className="flex items-center gap-3 w-full xl:w-auto justify-center xl:justify-start">
          <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-micro font-mono text-zinc-500 block leading-none">PARTNER SUITE</span>
            <h2 className="text-base font-black text-white font-display truncate max-w-[200px] sm:max-w-md">
              {venueName} Command Center
            </h2>
          </div>
        </div>

        {/* Kontrol Navigasi & Profil (Kanan) */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          
          <div className="flex bg-surface border border-zinc-800/80 p-1 rounded-lg w-full md:w-auto overflow-x-auto scrollbar-none">
            <Link 
              href="/admin-venue/slots"
              className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap flex-1 md:flex-none ${
                pathname.includes('/slots') 
                  ? 'bg-surface-hover text-white border border-zinc-800 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Grid className={`w-3.5 h-3.5 ${pathname.includes('/slots') ? 'text-brand-neon' : ''}`} />
              <span>SLOT MATRIX</span>
            </Link>
            <Link 
              href="/admin-venue/scan"
              className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap flex-1 md:flex-none ${
                pathname.includes('/scan') 
                  ? 'bg-surface-hover text-white border border-zinc-800 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ScanBarcode className={`w-3.5 h-3.5 ${pathname.includes('/scan') ? 'text-brand-emerald' : ''}`} />
              <span>SCANNER GATE</span>
            </Link>
            <Link 
              href="/admin-venue/reports"
              className={`px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap flex-1 md:flex-none ${
                pathname.includes('/reports') 
                  ? 'bg-surface-hover text-white border border-zinc-800 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <BarChart4 className={`w-3.5 h-3.5 ${pathname.includes('/reports') ? 'text-brand-amber' : ''}`} />
              <span>REPORTS</span>
            </Link>
          </div>

          {/* Sektor Profil & Logout */}
          <div className="flex items-center gap-3 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-zinc-800/80 pt-4 md:pt-0 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-left">
                <span className="text-micro font-mono text-zinc-500 block leading-none uppercase">VENUE ADMIN</span>
                <span className="text-xs font-bold text-white max-w-[120px] truncate block">
                  {currentUser?.user_metadata?.full_name || "Memuat..."}
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-red-950/20 hover:bg-red-900/60 border border-red-500/20 text-red-400 p-2 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center justify-center"
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