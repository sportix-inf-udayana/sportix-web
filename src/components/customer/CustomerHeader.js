"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LogOut, Settings, UserCircle2, Ticket, Trophy } from "lucide-react";

export default function CustomerHeader({ user }) {
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-8">
          <Link href="/" className="font-mono font-black text-xl tracking-wider text-white">
            SPORTIX<span className="text-brand-emerald">.</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-slate">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            {/* Navigasi diubah menjadi Tiket & Kios untuk mencerminkan isi halamannya */}
            <Link href="/umkm" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Ticket className="w-4 h-4" />
              <span>Tiket & Shop</span>
            </Link>
            <Link href="/tournaments" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Trophy className="w-4 h-4" />
              <span>Turnamen</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-sm font-medium text-brand-slate hover:text-white transition-colors"
              >
                Masuk
              </Link>
              <Link 
                href="/register" 
                className="text-sm font-medium px-4 py-2 bg-brand-emerald text-background rounded-full hover:bg-brand-emerald/90 transition-colors font-mono"
              >
                Daftar
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 pl-4 border-l border-zinc-800">
                
                <Link href="/profile" className="flex items-center gap-2.5 group">
                  <UserCircle2 className="w-8 h-8 text-brand-slate group-hover:text-brand-emerald transition-colors" />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white max-w-[120px] truncate leading-none">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-[10px] text-brand-slate font-mono uppercase tracking-widest mt-1">
                      {user.user_metadata?.role || "CUSTOMER"}
                    </p>
                  </div>
                </Link>

                <Link 
                  href="/profile/history" 
                  className="p-2 text-brand-slate hover:text-white transition-colors"
                  title="Riwayat Pemesanan"
                >
                  <Settings className="w-4 h-4" />
                </Link>
              </div>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold text-red-400 hover:bg-red-500/10 rounded-md transition-colors border border-red-500/10"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">KELUAR</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}