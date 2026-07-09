import React from "react";

export default function TransactionTable({ transactions }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-5 border-b border-zinc-800 bg-zinc-950">
        <h2 className="text-xs font-bold text-zinc-400 font-mono tracking-widest uppercase">Buku Besar Transaksi Lapangan</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-500 font-bold tracking-wider">
              <th className="p-5">WAKTU MUTASI</th>
              <th className="p-5">ID STRUKTUR</th>
              <th className="p-5">KATEGORI TRANSAKSI</th>
              <th className="p-5 text-right">JUMLAH</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-5 text-zinc-400">
                    {new Date(tx.created_at).toLocaleString("id-ID")}
                  </td>
                  <td className="p-5 text-zinc-500 select-all truncate max-w-[120px]">
                    {tx.id.substring(0,8)}...
                  </td>
                  <td className="p-5">
                    <span className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-brand-emerald text-[10px] font-bold uppercase tracking-wider">
                      {tx.source === "COURT_BOOKING" ? "Reservasi Lapangan" : tx.source}
                    </span>
                  </td>
                  <td className="p-5 text-right font-bold text-brand-emerald">
                    + Rp {tx.amount?.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-12 text-center text-zinc-600 font-medium">
                  Tidak ditemukan riwayat mutasi finansial yang terikat dengan entitas Anda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}