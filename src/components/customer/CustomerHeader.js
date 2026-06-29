"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LogOut, Settings, UserCircle2, ShoppingBag, Trophy } from "lucide-react";

export default function CustomerHeader({ user }) {
  const router = useRouter();
  
  // Inisialisasi klien browser Supabase murni untuk eksekusi mutasi sesi
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleLogout = async () => {
    // 1. Hancurkan token JWT di cookie browser dan server session table
    await supabase.auth.signOut();
    
    // 2. Paksa Server Component untuk mengevaluasi ulang tata letak (Layout)
    router.refresh();
    
    // 3. Kembalikan pengguna ke beranda publik dengan state bersih
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Sektor Kiri: Branding & Navigasi Utama */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-mono font-black text-xl tracking-wider text-white">
            SPORTIX<span className="text-brand-emerald">.</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-slate">
            <Link href="/" className="hover:text-white transition-colors">Aktivitas</Link>
            <Link href="/umkm" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <ShoppingBag className="w-4 h-4" />
              <span>Merchandise</span>
            </Link>
            <Link href="/tournaments" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Trophy className="w-4 h-4" />
              <span>Turnamen</span>
            </Link>
          </nav>
        </div>

        {/* Sektor Kanan: Blok Otentikasi Dinamis */}
        <div className="flex items-center gap-4">
          {!user ? (
            // STATE A: Pengguna Belum Terotentikasi
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
            // STATE B: Sesi Aktif Ditemukan
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 pl-4 border-l border-zinc-800">
                
                {/* Informasi Identitas Akun */}
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

                {/* Tombol Akses Pengaturan Cepat */}
                <Link 
                  href="/profile/history" 
                  className="p-2 text-brand-slate hover:text-white transition-colors"
                  title="Riwayat Pemesanan"
                >
                  <Settings className="w-4 h-4" />
                </Link>
              </div>

              {/* Pemutus Akses Seketika (Logout) */}
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