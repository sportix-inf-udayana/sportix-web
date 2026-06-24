/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (dashboard)
 * Path: src/app/(dashboard)/super-admin/audits/page.js
 * Deskripsi SRS: 
 * Konsol audit finansial dan pengawasan global. Digunakan untuk memproses persetujuan penarikan saldo massal (withdrawal verification), 
 * meneliti jejak riwayat mutasi pembukuan berpasangan (audit trails) pada buku besar aplikasi, serta mengeksekusi sengketa pengembalian dana 
 * lewat otorisasi manual tabel log refund.
 */

"use client";

import React, { useState } from "react";
import { 
  Shield, 
  TrendingUp, 
  Sliders, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  RefreshCw, 
  Inbox,
  Sparkles
} from "lucide-react";

export default function SuperAdminAuditsPage() {
  const [metrics, setMetrics] = useState({
    integrityMismatch: 0,
    expiredPaid: 12, // Forfeited due to 15-minute no-show
    unprocessedRefunds: 4,
    totalVolume: 124500000
  });

  const [ledger, setLedger] = useState([
    { id: "TX-10029", invoice: "INV-8829", amount: 150000, type: "FORFEITED SEIZURE", gateway: "QRIS", date: "WE 24 Oct", status: "FORFEITED" },
    { id: "TX-10028", invoice: "INV-8828", amount: 150000, type: "COURT BOOKING", gateway: "QRIS", date: "WE 24 Oct", status: "RECONCILIATED" },
    { id: "TX-10025", invoice: "INV-8825", amount: 150000, type: "COURT BOOKING", gateway: "QRIS", date: "WE 24 Oct", status: "RECONCILIATED" },
    { id: "TX-10020", invoice: "INV-8820", amount: 150000, type: "COURT BOOKING", gateway: "QRIS", date: "MO 22 Oct", status: "RECONCILIATED" },
    { id: "TX-10018", invoice: "INV-8818", amount: 500000, type: "LEAGUE SIGNUP", gateway: "CREDIT CARD", date: "MO 22 Oct", status: "RECONCILIATED" },
    { id: "TX-10015", invoice: "INV-8815", amount: 2450000, type: "UMKM GOODS", gateway: "QRIS", date: "SU 21 Oct", status: "RECONCILIATED" }
  ]);

  const handleClearRefunds = () => {
    if (metrics.unprocessedRefunds === 0) return;
    alert("Memproses sisa pengembalian dana cashless yang disetujui...");
    setMetrics({ ...metrics, unprocessedRefunds: 0 });
  };

  const navigateTo = (path) => {
    window.location.hash = path;
    if (window.__sportixNavigate) {
      window.__sportixNavigate(path);
    }
  };

  return (
    <div className="bg-[#09090b] text-[#e5e2e1] min-h-screen pb-16 font-sans select-none">
      
      {/* Top Header & Navigation Switch */}
      <div className="border-b border-zinc-800 bg-[#0e0e0e] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 block leading-none">SUPER COMMAND SUITE</span>
              <h2 className="text-base font-black text-white">Super Admin Console</h2>
            </div>
          </div>

          <div className="flex bg-[#131313] border border-zinc-800/80 p-1 rounded-lg">
            <button 
              onClick={() => navigateTo("/super-admin/verifications")}
              className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>ONBOARDING QUEUE</span>
            </button>
            <button 
              onClick={() => navigateTo("/super-admin/audits")}
              className="bg-[#1c1b1b] text-white px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-800"
            >
              <TrendingUp className="w-3.5 h-3.5 text-red-400" />
              <span>GLOBAL LEDGER</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">Global Financial Audit</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Buku besar digital dan pemantau integritas transaksi cashless Sportix. Seluruh aliran dana yang disita dari penalti keterlambatan 15-menit diaudit secara transparan di sini.
          </p>
        </div>

        {/* Audit Metrics row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          {/* Integrity Mismatch */}
          <div className="bg-[#131313] border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500" />
            <span className="text-[9px] font-mono text-zinc-500 block uppercase mb-1">INTEGRITY MISMATCH</span>
            <h3 className="text-2xl font-mono font-black text-emerald-400">
              {metrics.integrityMismatch} MISMATCH
            </h3>
            <p className="text-[10px] text-zinc-600 mt-3 font-mono">ALL LEDGERS SYNCHRONIZED</p>
          </div>

          {/* Expired Paid (Forfeits) */}
          <div className="bg-[#131313] border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500" />
            <span className="text-[9px] font-mono text-zinc-500 block uppercase mb-1">EXPIRED PAID (FORFEITS)</span>
            <h3 className="text-2xl font-mono font-black text-amber-500">
              {metrics.expiredPaid} SLOTS
            </h3>
            <p className="text-[10px] text-zinc-500 mt-3 font-mono">15-Min threshold forfeit seizure</p>
          </div>

          {/* Unprocessed Refunds */}
          <div className="bg-[#131313] border border-zinc-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500" />
            <div>
              <span className="text-[9px] font-mono text-zinc-500 block uppercase mb-1">UNPROCESSED REFUNDS</span>
              <h3 className="text-2xl font-mono font-black text-red-400">
                {metrics.unprocessedRefunds} REQUESTS
              </h3>
            </div>
            {metrics.unprocessedRefunds > 0 ? (
              <button
                onClick={handleClearRefunds}
                className="mt-3 bg-red-950/30 hover:bg-red-900/80 border border-red-500/20 hover:border-transparent text-red-400 hover:text-white font-mono text-[9px] py-1 rounded transition-all"
              >
                RESOLVE REFUNDS
              </button>
            ) : (
              <p className="text-[10px] text-zinc-600 mt-3 font-mono">CLEARED</p>
            )}
          </div>

          {/* Global Cashless Volume */}
          <div className="bg-[#131313] border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500" />
            <span className="text-[9px] font-mono text-zinc-500 block uppercase mb-1">GLOBAL CASHLESS VOLUME</span>
            <h3 className="text-2xl font-mono font-black text-white">
              Rp {metrics.totalVolume.toLocaleString("id-ID")}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-3 font-mono">RECONCILIATION VERIFIED</p>
          </div>

        </div>

        {/* Ledger Stream Table */}
        <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6">
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-red-400" /> LIVE TRANSACTIONAL AUDIT LEDGER
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase pb-3">
                  <th className="pb-3 font-semibold">TX ID</th>
                  <th className="pb-3 font-semibold">INVOICE</th>
                  <th className="pb-3 font-semibold">Kategori Aliran</th>
                  <th className="pb-3 font-semibold">Metode</th>
                  <th className="pb-3 font-semibold text-right">Nominal</th>
                  <th className="pb-3 font-semibold text-right">Status Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {ledger.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#18181b]/40">
                    <td className="py-4 font-bold text-white">{tx.id}</td>
                    <td className="py-4 text-zinc-400">{tx.invoice}</td>
                    <td className="py-4">
                      <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 text-zinc-400">{tx.gateway}</td>
                    <td className="py-4 text-right font-bold text-[#e5e2e1]">
                      Rp {tx.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 text-right">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        tx.status === "FORFEITED" ? "bg-amber-500/15 text-amber-500 border border-amber-500/20" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}