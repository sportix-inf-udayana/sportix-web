import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

export default function LedgerStreamTable({ streamData }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-1.5">
        <RefreshCw className="w-4 h-4 text-brand-emerald" /> IMMUTABLE LEDGER STREAM
      </h3>
      {streamData && streamData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase pb-3">
                <th className="pb-3 font-semibold">TX UUID</th>
                <th className="pb-3 font-semibold">Waktu (WITA)</th>
                <th className="pb-3 font-semibold">Sumber Transaksi</th>
                <th className="pb-3 font-semibold text-right">Nominal</th>
                <th className="pb-3 font-semibold text-right">Tipe Mutasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {streamData.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-4 font-bold text-zinc-300">
                    {tx.id.substring(0, 8)}...
                  </td>
                  <td className="py-4 text-zinc-400">
                    {new Date(tx.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })}
                  </td>
                  <td className="py-4">
                    <span className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                      {tx.source}
                    </span>
                  </td>
                  <td className="py-4 text-right font-bold text-white">
                    Rp {Number(tx.amount || 0).toLocaleString("id-ID")}
                  </td>
                  <td className="py-4 text-right flex justify-end">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded uppercase border w-max",
                      tx.transaction_type === "DEBIT" 
                        ? "bg-red-500/10 text-red-400 border-red-500/20" 
                        : "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20"
                    )}>
                      {tx.transaction_type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 border border-zinc-800 border-dashed rounded-lg">
          <AlertTriangle className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500 font-mono text-sm">Buku besar kosong. Belum ada rekonsiliasi yang terjadi.</p>
        </div>
      )}
    </div>
  );
}