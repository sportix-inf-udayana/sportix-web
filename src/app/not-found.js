import Link from "next/link";
import { FileQuestion, MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 font-sans relative">
      {/* Visual background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-neon/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center shadow-2xl relative z-10">
        <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-brand-neon mx-auto mb-5">
          <FileQuestion className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-black font-display text-white mb-2 uppercase tracking-wide">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-zinc-400 text-xs font-sans mb-6 leading-relaxed">
          Tautan atau rute enklaf yang Anda tuju tidak valid atau berada di luar yurisdiksi hak akses akun Anda di dalam ekosistem Sportix.
        </p>

        {/* Memanfaatkan gerbang dispatch profile yang telah dibuat untuk memilah rute balik secara otomatis */}
        <Link
          href="/profile"
          className="w-full bg-white hover:bg-zinc-200 text-black py-2.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-black/10"
        >
          <MoveLeft className="w-3.5 h-3.5" />
          <span>KEMBALI KE GERBANG UTAMA</span>
        </Link>
      </div>
    </div>
  );
}