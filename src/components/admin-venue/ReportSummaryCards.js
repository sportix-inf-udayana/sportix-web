import React from "react";
import { TrendingUp, CreditCard, ShieldCheck } from "lucide-react";

export default function ReportSummaryCards({ totalRevenue, transactionCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
      
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <TrendingUp className="w-16 h-16 text-brand-emerald" />
        </div>
        <div className="relative z-10">
          <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block mb-2">
            TOTAL REVENUE BERSIH
          </span>
          <span className="text-3xl font-black text-brand-emerald font-display tracking-tight">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <CreditCard className="w-16 h-16 text-white" />
        </div>
        <div className="relative z-10">
          <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block mb-2">
            TOTAL VOLUMETRIK TRANSAKSI
          </span>
          <span className="text-3xl font-black text-white font-display tracking-tight">
            {transactionCount} <span className="text-xl text-zinc-500 font-sans tracking-normal">Giat</span>
          </span>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg flex flex-col justify-center relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block mb-3">
            INTEGRITAS DATA (RLS)
          </span>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-brand-emerald px-3 py-1.5 rounded-lg w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
              SECURE CASHLESS
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}