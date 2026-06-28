import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Wallet, History, ArrowDownLeft, ArrowUpRight } from "lucide-react";

// Path relatif murni
import { getCoachWalletData } from "../../../../lib/services/coach.service";
import WithdrawalClientWrapper from "../../../../components/coach/WithdrawalClientWrapper";

export const dynamic = 'force-dynamic';

export default async function CoachWalletPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return <div className="p-8 text-red-500 font-mono text-center">Akses Ditolak.</div>;

  // Eksekusi Data Layer Terpusat
  const { availableBalance, pendingBalance, ledgerHistory } = await getCoachWalletData(supabase, user.id);

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8 font-sans select-none">
      <div className="mb-8">
        <span className="text-xs font-mono text-zinc-500 tracking-wider uppercase block mb-1">
          COACH REVENUE SYSTEM
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display flex items-center gap-3">
          <Wallet className="w-8 h-8 text-brand-neon" /> Dompet Digital
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-zinc-900 to-surface-elevated border border-zinc-800 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-neon/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block mb-2">SALDO TERSEDIA</span>
              <div className="text-4xl md:text-5xl font-black text-white font-display tracking-tight">
                Rp {availableBalance.toLocaleString("id-ID")}
              </div>
              <div className="mt-3 text-xs font-mono text-zinc-500">
                Tertunda (Menunggu Penyelesaian SLA): <span className="text-brand-amber font-bold">Rp {pendingBalance.toLocaleString("id-ID")}</span>
              </div>
            </div>
            {/* Tombol Interaktif di Client Component */}
            <WithdrawalClientWrapper maxBalance={availableBalance} />
          </div>
        </div>
      </div>

      {/* Tabel Mutasi Buku Besar (Server Rendered untuk keamanan & kecepatan) */}
      <div className="bg-surface border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-2 bg-surface-elevated">
          <History className="w-5 h-5 text-zinc-400" />
          <h3 className="font-bold text-white font-display">Mutasi Buku Besar (Double-Entry Log)</h3>
        </div>
        
        {ledgerHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-900/50 font-mono text-xs uppercase border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Waktu Transaksi (UTC)</th>
                  <th className="px-6 py-4">Tipe / Sumber</th>
                  <th className="px-6 py-4 text-right">Nominal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 font-mono">
                {ledgerHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-elevated transition-colors">
                    <td className="px-6 py-4 text-xs">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold">{log.source.replace(/_/g, ' ')}</span>
                      <span className={`block mt-1 text-micro px-2 py-0.5 rounded w-max ${
                        log.transaction_type === 'CREDIT' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {log.transaction_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex items-center justify-end gap-2 font-bold ${
                        log.transaction_type === 'CREDIT' ? 'text-brand-emerald' : 'text-red-400'
                      }`}>
                        {log.transaction_type === 'CREDIT' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        {log.amount.toLocaleString("id-ID")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-500 text-sm font-mono">
            Belum ada aktivitas transaksi finansial yang terekam pada buku besar Anda.
          </div>
        )}
      </div>
    </div>
  );
}