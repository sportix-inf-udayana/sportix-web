import React from "react";

export default function FinancialMetricsCards({ metrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-surface border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-[2px] ${metrics.integrityMismatch > 0 ? 'bg-red-500 animate-pulse' : 'bg-brand-emerald'}`} />
        <span className="text-micro font-mono text-zinc-500 block uppercase mb-1">INTEGRITY STATUS</span>
        <h3 className={`text-2xl font-mono font-black ${metrics.integrityMismatch > 0 ? 'text-red-400' : 'text-brand-neon'}`}>
          {metrics.integrityMismatch > 0 ? `${metrics.integrityMismatch} WARNINGS` : 'SECURE'}
        </h3>
        <p className="text-micro text-zinc-600 mt-3 font-mono">
          {metrics.integrityMismatch > 0 ? 'ANOMALI REKONSILIASI TERDETEKSI' : 'ALL LEDGERS SYNCHRONIZED'}
        </p>
      </div>

      <div className="bg-surface border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-amber" />
        <span className="text-micro font-mono text-zinc-500 block uppercase mb-1">FORFEITED SEIZURES</span>
        <h3 className="text-2xl font-mono font-black text-brand-amber">
          {metrics.forfeitedCount || 0} TIKET HANGUS
        </h3>
        <p className="text-micro text-zinc-500 mt-3 font-mono">Total eksekusi sanksi 15-Menit</p>
      </div>

      <div className="bg-surface border border-zinc-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500" />
        <div>
          <span className="text-micro font-mono text-zinc-500 block uppercase mb-1">UNPROCESSED REFUNDS</span>
          <h3 className="text-2xl font-mono font-black text-red-400">
            {metrics.unprocessedRefundsCount || 0} REQUESTS
          </h3>
        </div>
        {metrics.unprocessedRefundsCount > 0 ? (
          <button className="mt-3 bg-red-950/30 hover:bg-red-900 border border-red-500/20 text-red-400 font-mono text-micro py-1 rounded transition-all cursor-pointer">
            REVIEW REFUNDS
          </button>
        ) : (
          <p className="text-micro text-zinc-600 mt-3 font-mono">CLEARED</p>
        )}
      </div>

      <div className="bg-surface border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500" />
        <span className="text-micro font-mono text-zinc-500 block uppercase mb-1">GROSS CASHLESS VOLUME</span>
        <h3 className="text-2xl font-mono font-black text-white">
          Rp {Number(metrics.totalVolume || 0).toLocaleString("id-ID")}
        </h3>
        <p className="text-micro text-zinc-500 mt-3 font-mono">RECONCILIATION VERIFIED</p>
      </div>
    </div>
  );
}