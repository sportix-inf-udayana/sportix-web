"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";

export default function GlobalError({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    // Mencatat log pengecualian sistem ke konsol server/analitik eksternal demi audit kepatuhan
    console.error("[SPORTIX CRITICAL PANIC]:", error);
  }, [error]);

  const handleSystemRestore = () => {
    // Mencoba memicu pembangunan ulang modul cache lokal Next.js yang gagal
    reset();
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 font-sans relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center shadow-2xl relative z-10">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-5">
          <AlertOctagon className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-black font-display text-white mb-2 uppercase tracking-wide">
          Interupsi Sistem Terdeteksi
        </h2>
        <p className="text-zinc-400 text-xs font-sans mb-6 leading-relaxed">
          Terjadi kegagalan pemrosesan data terintegrasi atau masa berlaku sesi Anda telah habis. Lapisan keamanan mengunci rute ini demi menjaga integritas data keuangan Anda.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSystemRestore}
            className="flex-1 bg-white hover:bg-zinc-200 text-black py-2.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>PULIHKAN JALUR</span>
          </button>
          
          <button
            onClick={() => {
              // Bersihkan seluruh status macet dan paksa pengembalian ke pintu gerbang pemisah
              window.location.href = "/profile";
            }}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-zinc-700/50"
          >
            <Home className="w-3.5 h-3.5" />
            <span>KEMBALI KE PORTAL</span>
          </button>
        </div>
      </div>
    </div>
  );
}