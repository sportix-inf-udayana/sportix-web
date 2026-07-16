// src/components/admin-venue/TransactionTable.js
import React from "react";
import { BOOKING_STATUS } from "@/lib/constants";

export default function TransactionTable({ transactions = [] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-10 text-zinc-500 bg-zinc-950 rounded-xl border border-dashed border-zinc-800 font-mono text-xs uppercase tracking-widest">
        TIDAK ADA DATA TRANSAKSI
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
      case BOOKING_STATUS.CHECKED_IN:
      case BOOKING_STATUS.COMPLETED:
        return <span className="px-2 py-0.5 bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 text-[10px] font-bold rounded uppercase tracking-widest">SETTLED</span>;
      case BOOKING_STATUS.PENDING:
        return <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold rounded uppercase tracking-widest">PENDING</span>;
      case BOOKING_STATUS.FORFEITED:
      case BOOKING_STATUS.EXPIRED_PAID:
        return <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold rounded uppercase tracking-widest">{status}</span>;
      case BOOKING_STATUS.CANCELLED_BY_ADMIN:
        return <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold rounded uppercase tracking-widest">CANCELLED</span>;
      default:
        return <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-bold rounded uppercase tracking-widest">{status}</span>;
    }
  };

  return (
    <div className="overflow-x-auto bg-zinc-900 border border-zinc-800 rounded-xl">
      <table className="w-full text-left border-collapse text-sm font-sans text-white">
        <thead>
          <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
            <th className="p-4 font-bold">Booking UUID</th>
            <th className="p-4 font-bold">Jadwal Main</th>
            <th className="p-4 font-bold text-right">Volume</th>
            <th className="p-4 font-bold text-right">Status</th>
            <th className="p-4 font-bold text-right">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-zinc-800/40 transition-colors">
              <td className="p-4 font-mono text-zinc-400 text-xs">
                REV-{tx.id.substring(0, 8)}
              </td>
              <td className="p-4 text-zinc-300 text-xs font-mono font-bold">
                {tx.booking_date}
              </td>
              <td className="p-4 font-bold text-white text-right font-mono text-xs">
                Rp {Number(tx.total_price || 0).toLocaleString('id-ID')}
              </td>
              <td className="p-4 text-right">
                {getStatusBadge(tx.status)}
              </td>
              <td className="p-4 text-zinc-500 text-[10px] font-mono text-right">
                {new Date(tx.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}