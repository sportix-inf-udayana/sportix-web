import React from "react";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  return (
    <div className="w-full space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Laporan Keuangan</h1>
        <p className="text-sm text-brand-slate mt-1">
          Buku besar agregasi pendapatan operasional dan sita tiket (forfeit).
        </p>
      </div>

      {/* Konten tabel laporan akan masuk ke sini */}
      <div className="p-8 border border-zinc-800 border-dashed rounded-xl flex items-center justify-center bg-zinc-900/50">
        <p className="text-brand-slate font-mono text-sm">MODUL ANALITIK DALAM PENGEMBANGAN</p>
      </div>
    </div>
  );
}