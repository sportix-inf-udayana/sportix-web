import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { AlertTriangle, RefreshCw } from "lucide-react";

// Path relatif murni sesuai arsitektur
import { getGlobalFinancialMetrics } from "../../../../lib/services/admin.service";
import SuperAdminHeader from "../../../../components/super-admin/SuperAdminHeader";

export const dynamic = 'force-dynamic';

export default async function SuperAdminAuditsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return <div className="p-8 text-red-500 font-mono text-center">Akses Ditolak.</div>;
  
  const { data: adminCheck } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!adminCheck || adminCheck.role !== 'SUPER_ADMIN') {
    return <div className="p-8 text-red-500 font-mono text-center">Forbidden. Khusus Super Admin.</div>;
  }

  // Pengambilan data terpusat dari Data Layer
  const metrics = await getGlobalFinancialMetrics(supabase);

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans select-none">
      <SuperAdminHeader />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white font-display">Global Financial Audit</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Data disinkronisasi secara real-time dari tabel <code className="bg-zinc-800 px-1 rounded">ledger_transactions</code>. 
            Modul ini menolak cache untuk menjamin presisi akuntansi absolut.
          </p>
        </div>

        {/* Audit Metrics row */}
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
              Rp {metrics.totalVolume.toLocaleString("id-ID")}
            </h3>
            <p className="text-micro text-zinc-500 mt-3 font-mono">RECONCILIATION VERIFIED</p>
          </div>
        </div>

        {/* Ledger Stream Table */}
        <div className="bg-surface border border-zinc-800 rounded-xl p-6">
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-red-400" /> IMMUTABLE LEDGER STREAM
          </h3>

          {metrics.ledgerStream && metrics.ledgerStream.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase pb-3">
                    <th className="pb-3 font-semibold">TX UUID</th>
                    <th className="pb-3 font-semibold">Waktu (UTC)</th>
                    <th className="pb-3 font-semibold">Sumber Transaksi</th>
                    <th className="pb-3 font-semibold text-right">Nominal</th>
                    <th className="pb-3 font-semibold text-right">Tipe Mutasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {metrics.ledgerStream.map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-hover/40">
                      <td className="py-4 font-bold text-zinc-300">
                        {tx.id.substring(0, 8)}...
                      </td>
                      <td className="py-4 text-zinc-400">{new Date(tx.created_at).toLocaleString('id-ID')}</td>
                      <td className="py-4">
                        <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                          {tx.source}
                        </span>
                      </td>
                      <td className="py-4 text-right font-bold text-white">
                        Rp {Number(tx.amount).toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 text-right">
                        <span className={`text-micro font-bold px-2 py-0.5 rounded uppercase ${
                          tx.transaction_type === "DEBIT" ? "bg-red-500/15 text-red-400 border border-red-500/20" : "bg-brand-emerald/15 text-brand-neon border border-brand-emerald/20"
                        }`}>
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
      </div>
    </div>
  );
}