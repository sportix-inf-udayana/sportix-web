"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";

export default function GlobalError({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    console.error("[SPORTIX CRITICAL PANIC]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 font-sans relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-red-500 mx-auto mb-6 shadow-inner">
          <AlertOctagon className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-black font-display text-white mb-3 uppercase tracking-wide">
          Interupsi Sistem Terdeteksi
        </h2>
        <p className="text-zinc-400 text-sm font-sans mb-8 leading-relaxed">
          Terjadi kegagalan pemrosesan data terintegrasi atau masa berlaku sesi otorisasi Anda telah habis. Sistem dikunci demi menjaga integritas data.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => { reset(); router.refresh(); }}
            className="flex-1 bg-white hover:bg-zinc-200 text-black py-3.5 rounded-xl text-xs font-mono font-bold tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md uppercase"
          >
            <RefreshCw className="w-4 h-4" />
            <span>PULIHKAN SIKLUS</span>
          </button>
          
          <button
            onClick={() => window.location.href = "/profile"}
            className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white py-3.5 rounded-xl text-xs font-mono font-bold tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer border border-zinc-800 uppercase"
          >
            <Home className="w-4 h-4" />
            <span>PORTAL UTAMA</span>
          </button>
        </div>
      </div>
    </div>
  );
}