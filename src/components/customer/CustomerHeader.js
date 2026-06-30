"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ShoppingCart, User, LayoutDashboard, LogOut } from "lucide-react";

export default function CustomerHeader() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("CUSTOMER");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        setRole(data.user.user_metadata?.role || "CUSTOMER");
      }
    });
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole("CUSTOMER");
    router.refresh();
    router.push("/");
  };

  // Pemetaan rute balik dashboard berdasarkan role rahasia JWT
  const getDashboardLink = () => {
    switch (role) {
      case "SUPER_ADMIN": return "/super-admin/verifications";
      case "ADMIN_VENUE": return "/admin-venue/slots";
      case "COACH": return "/coach/schedule";
      case "UMKM_SELLER": return "/seller-umkm/products";
      default: return null;
    }
  };

  const dashboardLink = getDashboardLink();

  return (
    <header className="w-full bg-zinc-950 border-b border-zinc-900 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Sektor Brand */}
        <Link href="/" className="font-display font-black text-xl tracking-tighter text-white hover:opacity-90 transition-opacity">
          SPORTIX<span className="text-brand-neon">.</span>
        </Link>

        {/* Navigasi Inti */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-mono font-bold text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">CARI LAPANGAN</Link>
          <Link href="/umkm" className="hover:text-white transition-colors">LOKAPASAR UMKM</Link>
          <Link href="/tournaments" className="hover:text-white transition-colors">TURNAMEN</Link>
        </nav>

        {/* Sektor Kontrol User */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              
              {/* Jembatan Penghubung Lintas Portal Dinamis */}
              {dashboardLink && (
                <Link 
                  href={dashboardLink}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-brand-neon text-xs font-mono font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PANEL KONTROL</span>
                </Link>
              )}

              <Link href="/profile" className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:border-zinc-700 transition-colors">
                <User className="w-4 h-4" />
              </Link>

              <button 
                onClick={handleLogout}
                className="text-zinc-500 hover:text-red-400 p-2 rounded-lg text-xs font-mono transition-colors"
                title="Keluar Akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-zinc-400 hover:text-white text-xs font-mono font-bold px-4 py-2 transition-colors">
                MASUK
              </Link>
              <Link href="/register" className="bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold px-4 py-2 rounded-lg transition-colors">
                DAFTAR
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}