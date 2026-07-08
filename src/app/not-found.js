import Link from "next/link";
import { FileQuestion, MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 font-sans relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-emerald/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center shadow-2xl relative z-10">
        <div className="w-14 h-14 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-brand-emerald mx-auto mb-6 shadow-inner">
          <FileQuestion className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-black font-display text-white mb-3 uppercase tracking-wide">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-zinc-400 text-sm font-sans mb-8 leading-relaxed">
          Tautan atau rute enklaf yang Anda tuju tidak valid atau berada di luar yurisdiksi hak akses akun Anda di dalam ekosistem Sportix.
        </p>

        <Link
          href="/profile"
          className="w-full bg-white hover:bg-zinc-200 text-black py-3.5 rounded-xl text-xs font-mono font-bold tracking-widest flex items-center justify-center gap-2 transition-all shadow-md uppercase"
        >
          <MoveLeft className="w-4 h-4" />
          <span>KEMBALI KE GERBANG UTAMA</span>
        </Link>
      </div>
    </div>
  );
}