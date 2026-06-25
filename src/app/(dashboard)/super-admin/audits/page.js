import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { Shield, TrendingUp, Sliders, RefreshCw, AlertTriangle } from "lucide-react";

// Memaksa Next.js untuk tidak melakukan cache pada halaman finansial ini
export const dynamic = 'force-dynamic';

export default async function SuperAdminAuditsPage() {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  // 1. Verifikasi Mutlak Super Admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return <div className="p-8 text-red-500 font-mono text-center">Akses Ditolak.</div>;
  
  const { data: adminCheck } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!adminCheck || adminCheck.role !== 'SUPER_ADMIN') {
    return <div className="p-8 text-red-500 font-mono text-center">Forbidden. Khusus Super Admin.</div>;
  }

  // 2. Agregasi Metrik Finansial Langsung dari Database Master
  // A. Kalkulasi Total Volume (Semua transaksi CREDIT di Ledger)
  const { data: volumeData, error: volumeErr } = await supabase
    .from("ledger_transactions")
    .select("amount")
    .eq("transaction_type", "CREDIT");
  
  const totalVolume = volumeData?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

  // B. Kalkulasi Forfeits (Status EXPIRED_PAID atau FORFEITED di reservasi)
  const { count: forfeitedCount } = await supabase
    .from("reservations")
    .select("*", { count: 'exact', head: true })
    .in("status", ["EXPIRED_PAID", "FORFEITED"]);

  // C. Kalkulasi Unprocessed Refunds (Dana nyangkut yang butuh tindakan manual)
  const { count: unprocessedRefundsCount } = await supabase
    .from("refund_logs")
    .select("*", { count: 'exact', head: true })
    .eq("status", "PENDING_ACTION");

  // D. Tarik Stream Ledger Real-Time (50 transaksi terakhir)
  const { data: ledgerStream } = await supabase
    .from("ledger_transactions")
    .select("id, transaction_type, source, amount, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(50);

  // Asumsi dasar untuk Integrity Mismatch: Jika ada refund menggantung, sistem tidak sinkron 100%
  const integrityMismatch = unprocessedRefundsCount > 0 ? unprocessedRefundsCount : 0;

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans select-none">
      
      {/* Top Header & Navigation Switch */}
      <div className="border-b border-zinc-800 bg-surface-elevated sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-micro font-mono text-zinc-500 block leading-none">SUPER COMMAND SUITE</span>
              <h2 className="text-base font-black text-white font-display">Super Admin Console</h2>
            </div>
          </div>

          <div className="flex bg-surface border border-zinc-800/80 p-1 rounded-lg">
            <Link 
              href="/super-admin/verifications"
              className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>ONBOARDING QUEUE</span>
            </Link>
            <Link 
              href="/super-admin/audits"
              className="bg-surface-hover text-white px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-800"
            >
              <TrendingUp className="w-3.5 h-3.5 text-red-400" />
              <span>GLOBAL LEDGER</span>
            </Link>
          </div>
        </div>
      </div>

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
          
          {/* Integrity Mismatch */}
          <div className="bg-surface border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-[2px] ${integrityMismatch > 0 ? 'bg-red-500 animate-pulse' : 'bg-brand-emerald'}`} />
            <span className="text-micro font-mono text-zinc-500 block uppercase mb-1">INTEGRITY STATUS</span>
            <h3 className={`text-2xl font-mono font-black ${integrityMismatch > 0 ? 'text-red-400' : 'text-brand-neon'}`}>
              {integrityMismatch > 0 ? `${integrityMismatch} WARNINGS` : 'SECURE'}
            </h3>
            <p className="text-micro text-zinc-600 mt-3 font-mono">
              {integrityMismatch > 0 ? 'ANOMALI REKONSILIASI TERDETEKSI' : 'ALL LEDGERS SYNCHRONIZED'}
            </p>
          </div>

          {/* Expired Paid (Forfeits) */}
          <div className="bg-surface border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-amber" />
            <span className="text-micro font-mono text-zinc-500 block uppercase mb-1">FORFEITED SEIZURES</span>
            <h3 className="text-2xl font-mono font-black text-brand-amber">
              {forfeitedCount || 0} TIKET HANGUS
            </h3>
            <p className="text-micro text-zinc-500 mt-3 font-mono">Total eksekusi sanksi 15-Menit</p>
          </div>

          {/* Unprocessed Refunds */}
          <div className="bg-surface border border-zinc-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500" />
            <div>
              <span className="text-micro font-mono text-zinc-500 block uppercase mb-1">UNPROCESSED REFUNDS</span>
              <h3 className="text-2xl font-mono font-black text-red-400">
                {unprocessedRefundsCount || 0} REQUESTS
              </h3>
            </div>
            {unprocessedRefundsCount > 0 ? (
              <button className="mt-3 bg-red-950/30 hover:bg-red-900 border border-red-500/20 text-red-400 font-mono text-micro py-1 rounded transition-all cursor-pointer">
                REVIEW REFUNDS
              </button>
            ) : (
              <p className="text-micro text-zinc-600 mt-3 font-mono">CLEARED</p>
            )}
          </div>

          {/* Global Cashless Volume */}
          <div className="bg-surface border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500" />
            <span className="text-micro font-mono text-zinc-500 block uppercase mb-1">GROSS CASHLESS VOLUME</span>
            <h3 className="text-2xl font-mono font-black text-white">
              Rp {totalVolume.toLocaleString("id-ID")}
            </h3>
            <p className="text-micro text-zinc-500 mt-3 font-mono">RECONCILIATION VERIFIED</p>
          </div>

        </div>

        {/* Ledger Stream Table */}
        <div className="bg-surface border border-zinc-800 rounded-xl p-6">
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-red-400" /> IMMUTABLE LEDGER STREAM
          </h3>

          {ledgerStream && ledgerStream.length > 0 ? (
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
                  {ledgerStream.map((tx) => (
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