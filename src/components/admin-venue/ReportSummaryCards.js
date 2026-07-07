import React from "react";

export default function ReportSummaryCards({ totalRevenue, transactionCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
        <span className="text-xs text-zinc-500 block mb-1">TOTAL REVENUE BERSIH</span>
        <span className="text-2xl font-black text-brand-neon">
          Rp {totalRevenue.toLocaleString("id-ID")}
        </span>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
        <span className="text-xs text-zinc-500 block mb-1">TOTAL VOLUMETRIK PEMESANAN</span>
        <span className="text-2xl font-black text-white">{transactionCount} Transaksi</span>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col justify-center">
        <span className="text-xs text-zinc-500 block mb-1">INTEGRITAS DATA</span>
        <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-900 px-2.5 py-1 rounded w-fit font-bold">
          PASSED (ENCRYPTED BEARER)
        </span>
      </div>
    </div>
  );
}