// src/components/admin-venue/ReportSummaryCards.js
import React from "react";

export default function ReportSummaryCards({ summary }) {
  const data = summary || { revenue: 0, successful: 0, pending: 0, totalTransactions: 0 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-emerald" />
        <span className="text-[10px] font-mono text-zinc-500 block uppercase mb-1 tracking-widest font-bold">Gross Revenue</span>
        <span className="text-2xl font-black text-white font-mono">
          Rp {Number(data.revenue).toLocaleString('id-ID')}
        </span>
      </div>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500" />
        <span className="text-[10px] font-mono text-zinc-500 block uppercase mb-1 tracking-widest font-bold">Settled Bookings</span>
        <span className="text-2xl font-black text-blue-400 font-mono">
          {data.successful}
        </span>
      </div>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500" />
        <span className="text-[10px] font-mono text-zinc-500 block uppercase mb-1 tracking-widest font-bold">Pending Hooks</span>
        <span className="text-2xl font-black text-amber-500 font-mono">
          {data.pending}
        </span>
      </div>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-zinc-600" />
        <span className="text-[10px] font-mono text-zinc-500 block uppercase mb-1 tracking-widest font-bold">Total Operations</span>
        <span className="text-2xl font-black text-zinc-300 font-mono">
          {data.totalTransactions}
        </span>
      </div>
    </div>
  );
}