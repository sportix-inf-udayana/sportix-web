"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { User, LayoutDashboard, LogOut } from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ROLE_DASHBOARD_MAP = {
  SUPER_ADMIN: "/super-admin/verifications",
  ADMIN_VENUE: "/admin-venue/slots",
  COACH: "/coach/schedule",
  UMKM_SELLER: "/seller-umkm/products",
};

export default function CustomerHeader() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("CUSTOMER");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        setRole(data.user.user_metadata?.role || "CUSTOMER");
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole("CUSTOMER");
    router.refresh();
    router.push("/");
  };

  const dashboardLink = ROLE_DASHBOARD_MAP[role] || null;

  return (
    <header className="w-full bg-zinc-950 border-b border-zinc-900 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        <Link href="/" className="font-display font-black text-xl tracking-tighter text-white hover:opacity-90 transition-opacity">
          SPORTIX<span className="text-brand-emerald">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-mono font-bold text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">CARI LAPANGAN</Link>
          <Link href="/umkm" className="hover:text-white transition-colors">Store</Link>
          <Link href="/tournaments" className="hover:text-white transition-colors">TURNAMEN</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {dashboardLink && (
                <Link 
                  href={dashboardLink}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-brand-emerald text-xs font-mono font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PANEL KONTROL</span>
                </Link>
              )}

              <Link href="/profile" className="flex items-center gap-2 group px-2 py-1.5 rounded-lg hover:bg-zinc-900 transition-colors">
                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center group-hover:border-brand-emerald transition-colors">
                  <User className="w-3.5 h-3.5 text-zinc-400 group-hover:text-brand-emerald transition-colors" />
                </div>
                <span className="text-xs font-bold text-zinc-300 hidden md:block max-w-[100px] truncate group-hover:text-brand-emerald transition-colors">
                  {user.user_metadata?.full_name?.split(' ')[0] || "User"}
                </span>
              </Link>

              <div className="w-px h-6 bg-zinc-800 mx-1 hidden sm:block"></div>

              <button 
                onClick={handleLogout}
                className="bg-zinc-950 hover:bg-red-950/20 border border-transparent hover:border-red-500/30 text-zinc-500 hover:text-red-400 p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center"
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
              <Link href="/register" className="bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold px-4 py-2 rounded-lg transition-colors shadow-md">
                DAFTAR
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}