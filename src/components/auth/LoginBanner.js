import React from "react";
import { ShieldCheck, Zap, BarChart3 } from "lucide-react";

export default function LoginBanner() {
  return (
    <div className="w-full h-full flex flex-col justify-center px-16 text-white font-sans">
      <div className="mb-10">
        <h2 className="text-4xl font-black font-display uppercase tracking-tighter mb-4">
          Ekosistem <br /> Sportix Otonom.
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
          Sistem reservasi terpusat dengan transparansi ledger real-time. Keamanan transaksi dijamin oleh protokol enkripsi tingkat lanjut.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verifikasi Real-time</h4>
            <p className="text-[10px] text-zinc-500 font-mono">Keamanan data mitra terenkripsi</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Eksekusi Otonom</h4>
            <p className="text-[10px] text-zinc-500 font-mono">Pemesanan tanpa intervensi manual</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Audit Finansial</h4>
            <p className="text-[10px] text-zinc-500 font-mono">Sistem akuntansi terintegrasi</p>
          </div>
        </div>
      </div>
    </div>
  );
}