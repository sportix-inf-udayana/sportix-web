"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Briefcase, Truck, Layers, LogOut, User } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function UmkmHeader({ activeRoute }) {
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
    <div className="border-b border-zinc-900 bg-zinc-950 sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 block leading-none mb-1">MERCHANT PORTAL</span>
            <h2 className="text-base font-black text-white font-display uppercase tracking-wide">UMKM Seller Hub</h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-none">
            <Link 
              href="/seller-umkm/products"
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all whitespace-nowrap flex-1 sm:flex-none",
                activeRoute === 'products' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Layers className={cn("w-4 h-4", activeRoute === 'products' && "text-purple-500")} />
              <span>INVENTORY MGR</span>
            </Link>
            <Link 
              href="/seller-umkm/orders"
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all whitespace-nowrap flex-1 sm:flex-none",
                activeRoute === 'orders' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Truck className={cn("w-4 h-4", activeRoute === 'orders' && "text-purple-500")} />
              <span>SHIPMENT ORDERS</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-zinc-800 pt-4 sm:pt-0 w-full sm:w-auto justify-between sm:justify-start">
            <Link href="/profile" className="flex items-center gap-3 group cursor-pointer px-3 py-2 rounded-lg hover:bg-zinc-900 transition-colors">
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center group-hover:border-purple-500 transition-colors">
                <User className="w-4 h-4 text-zinc-400 group-hover:text-purple-500 transition-colors" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 block leading-none uppercase mb-1">MERCHANT</span>
                <span className="text-xs font-bold text-white max-w-[110px] truncate block group-hover:text-purple-500 transition-colors">
                  {currentUser?.user_metadata?.full_name || "Memuat..."}
                </span>
              </div>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="bg-zinc-900 hover:bg-purple-950/40 border border-zinc-800 hover:border-purple-500/50 text-zinc-400 hover:text-purple-500 p-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center shadow-sm"
              title="Akhiri Sesi Jualan"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}