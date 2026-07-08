import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

export default function FinancialMetricsCards({ metrics }) {
  const { 
    integrityMismatch = 0, 
    forfeitedCount = 0, 
    unprocessedRefundsCount = 0, 
    totalVolume = 0 
  } = metrics || {};
  
  const hasMismatch = integrityMismatch > 0;
  const hasRefunds = unprocessedRefundsCount > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Integrity Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
        <div className={cn("absolute top-0 left-0 right-0 h-[2px]", hasMismatch ? "bg-red-500 animate-pulse" : "bg-brand-emerald")} />
        <span className="text-[10px] font-mono text-zinc-500 block uppercase mb-1">INTEGRITY STATUS</span>
        <h3 className={cn("text-2xl font-mono font-black", hasMismatch ? "text-red-400" : "text-brand-emerald")}>
          {hasMismatch ? `${integrityMismatch} WARNINGS` : 'SECURE'}
        </h3>
        <p className="text-[10px] text-zinc-600 mt-3 font-mono">
          {hasMismatch ? 'ANOMALI REKONSILIASI TERDETEKSI' : 'ALL LEDGERS SYNCHRONIZED'}
        </p>
      </div>

      {/* Forfeited Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500" />
        <span className="text-[10px] font-mono text-zinc-500 block uppercase mb-1">FORFEITED SEIZURES</span>
        <h3 className="text-2xl font-mono font-black text-amber-500">
          {forfeitedCount} TIKET HANGUS
        </h3>
        <p className="text-[10px] text-zinc-500 mt-3 font-mono">Total eksekusi sanksi 15-Menit</p>
      </div>

      {/* Refunds Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500" />
        <div>
          <span className="text-[10px] font-mono text-zinc-500 block uppercase mb-1">UNPROCESSED REFUNDS</span>
          <h3 className="text-2xl font-mono font-black text-red-400">
            {unprocessedRefundsCount} REQUESTS
          </h3>
        </div>
        {hasRefunds ? (
          <button className="mt-3 bg-red-950/30 hover:bg-red-900 border border-red-500/20 text-red-400 font-mono text-[10px] py-1.5 rounded transition-all cursor-pointer">
            REVIEW REFUNDS
          </button>
        ) : (
          <p className="text-[10px] text-zinc-600 mt-3 font-mono">CLEARED</p>
        )}
      </div>

      {/* Volume Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500" />
        <span className="text-[10px] font-mono text-zinc-500 block uppercase mb-1">GROSS CASHLESS VOLUME</span>
        <h3 className="text-2xl font-mono font-black text-white">
          Rp {Number(totalVolume).toLocaleString("id-ID")}
        </h3>
        <p className="text-[10px] text-zinc-500 mt-3 font-mono">RECONCILIATION VERIFIED</p>
      </div>
    </div>
  );
}