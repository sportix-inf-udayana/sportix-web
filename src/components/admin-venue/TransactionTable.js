import React from "react";

export default function TransactionTable({ transactions }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <h2 className="text-sm font-bold text-zinc-300">Buku Besar Transaksi Lapangan</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 font-bold">
              <th className="p-4">WAKTU MUTASI</th>
              <th className="p-4">ID STRUKTUR</th>
              <th className="p-4">SUMBER</th>
              <th className="p-4">NAMA LAPANGAN</th>
              <th className="p-4 text-right">JUMLAH</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4 text-zinc-500">
                    {new Date(tx.created_at).toLocaleString("id-ID")}
                  </td>
                  <td className="p-4 text-zinc-400 font-mono select-all truncate max-w-[120px]">
                    {tx.id}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-zinc-800 rounded text-zinc-400 text-[10px] font-bold">
                      {tx.source}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-300">
                    {tx.reservations?.fields?.name || "Fasilitas Terhapus"}
                  </td>
                  <td className="p-4 text-right font-bold text-emerald-400">
                    + Rp {tx.amount?.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-zinc-600 font-medium">
                  Tidak ditemukan riwayat data transaksi yang terikat dengan ID otentikasi Anda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}