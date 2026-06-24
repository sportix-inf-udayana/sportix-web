/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (dashboard)
 * Path: src/app/(dashboard)/admin-venue/reports/page.js
 * Deskripsi SRS: 
 * Dasbor analisis keuangan mandiri bagi pemilik tempat usaha. Menampilkan data analitik tingkat okupansi lapangan, 
 * grafik akumulasi omset harian/bulanan, serta pelaporan otomatis dana sitaan penalti hangus akibat pembatalan 
 * sepihak atau no-show customer yang ditarik dari tabel revenue_reports.
 */

"use client";

import React from "react";
import {
  Activity,
  ScanBarcode,
  BarChart4,
  Grid,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  ActivitySquare,
  Sparkles,
  Award
} from "lucide-react";

export default function AdminReportsPage() {
  const stats = {
    totalRevenue: 124500000,
    operationalIncome: 102090000,
    penaltyIncome: 22410000,
    integrityMismatch: 0,
    activeSubscribers: 184,
  };

  const revenueBreakdown = [
    { day: "Senin", ops: 15200000, penalty: 2400000 },
    { day: "Selasa", ops: 13500000, penalty: 1500000 },
    { day: "Rabu", ops: 16800000, penalty: 3600000 },
    { day: "Kamis", ops: 14100000, penalty: 4500000 },
    { day: "Jumat", ops: 18500000, penalty: 1200000 },
    { day: "Sabtu", ops: 24000000, penalty: 9200000 },
  ];

  const navigateTo = (path) => {
    window.location.hash = path;
    if (window.__sportixNavigate) {
      window.__sportixNavigate(path);
    }
  };

  return (
    <div className="bg-[#09090b] text-[#e5e2e1] min-h-screen pb-16 font-sans select-none">

    {/* Top dashboard navigation bar */}
    <div className="border-b border-zinc-800 bg-[#0e0e0e] sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
    <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
    <Activity className="w-4 h-4" />
    </div>
    <div>
    <span className="text-[10px] font-mono text-zinc-500 block leading-none">PARTNER SUITE</span>
    <h2 className="text-base font-black text-white">Academy Stadium Partner Suite</h2>
    </div>
    </div>

    <div className="flex bg-[#131313] border border-zinc-800/80 p-1 rounded-lg">
    <button
    onClick={() => navigateTo("/admin-venue/slots")}
    className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
    >
    <Grid className="w-3.5 h-3.5" />
    <span>SLOT MATRIX</span>
    </button>
    <button
    onClick={() => navigateTo("/admin-venue/scan")}
    className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
    >
    <ScanBarcode className="w-3.5 h-3.5" />
    <span>SCANNER GATE</span>
    </button>
    <button
    onClick={() => navigateTo("/admin-venue/reports")}
    className="bg-[#1c1b1b] text-white px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-800"
    >
    <BarChart4 className="w-3.5 h-3.5 text-[#4edea3]" />
    <span>REPORTS</span>
    </button>
    </div>
    </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 mt-8">
    <div className="mb-8">
    <h1 className="text-2xl font-black text-white">Analytical Revenue Reports</h1>
    <p className="text-zinc-400 text-xs md:text-sm mt-1">
    Segregasi dan laporan akuntansi keuangan digital Sportix secara real-time. Melacak rasio pendapatan operasional reguler dan denda penyitaan no-show secara transparan.
    </p>
    </div>

    {/* 3 Metric Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

    {/* Card 1: Total Revenue */}
    <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#4edea3]" />
    <div className="flex justify-between items-start">
    <div>
    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
    TOTAL DIGITAL REVENUE
    </span>
    <h3 className="text-2xl md:text-3xl font-mono font-black text-white">
    Rp {stats.totalRevenue.toLocaleString("id-ID")}
    </h3>
    </div>
    <div className="w-10 h-10 rounded bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center text-[#4edea3]">
    <TrendingUp className="w-5 h-5" />
    </div>
    </div>
    <p className="text-[10px] text-zinc-500 mt-4 uppercase font-mono tracking-wider">
    🟢 SECURE CASHLESS • EXCLUDES MANUAL CASH
    </p>
    </div>

    {/* Card 2: Operational Income */}
    <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-500" />
    <div className="flex justify-between items-start">
    <div>
    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
    ARENA OPERATIONAL INCOME
    </span>
    <h3 className="text-2xl md:text-3xl font-mono font-black text-blue-400">
    Rp {stats.operationalIncome.toLocaleString("id-ID")}
    </h3>
    </div>
    <div className="w-10 h-10 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
    <ActivitySquare className="w-5 h-5" />
    </div>
    </div>
    <p className="text-[10px] text-zinc-500 mt-4 uppercase font-mono tracking-wider">
    Regular slot court booking streams
    </p>
    </div>

    {/* Card 3: Forfeit Penalty Income */}
    <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500" />
    <div className="flex justify-between items-start">
    <div>
    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
    FORFEIT NO-SHOW PENALTY
    </span>
    <h3 className="text-2xl md:text-3xl font-mono font-black text-amber-500">
    Rp {stats.penaltyIncome.toLocaleString("id-ID")}
    </h3>
    </div>
    <div className="w-10 h-10 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
    <ShieldAlert className="w-5 h-5" />
    </div>
    </div>
    <p className="text-[10px] text-zinc-500 mt-4 uppercase font-mono tracking-wider">
    Automatic 15-Min threshold forfeit seizure
    </p>
    </div>

    </div>

    {/* Breakdown Visualizer Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

    {/* Main Visualizer Bar Chart (8 Columns) */}
    <div className="lg:col-span-8 bg-[#131313] border border-zinc-800 rounded-xl p-6">
    <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-6">
    Weekly Revenue Streams Segregation
    </h3>

    {/* Custom columns chart */}
    <div className="space-y-6">
    {revenueBreakdown.map((item, index) => {
      const total = item.ops + item.penalty;
      const opsPercent = (item.ops / 35000000) * 100;
      const penaltyPercent = (item.penalty / 35000000) * 100;

      return (
        <div key={index} className="space-y-1.5 font-mono">
        <div className="flex justify-between text-xs text-zinc-400">
        <span>{item.day}</span>
        <span>Total: Rp {total.toLocaleString("id-ID")}</span>
        </div>
        {/* Visual Progress Bar */}
        <div className="h-6 bg-[#0e0e0e] border border-zinc-900 rounded-md overflow-hidden flex">
        <div
        style={{ width: `${opsPercent}%` }}
        className="bg-blue-500/80 hover:bg-blue-500 transition-all flex items-center pl-2 text-[9px] text-[#09090b] font-bold"
        title="Operational"
        >
        {opsPercent > 15 && "Ops"}
        </div>
        <div
        style={{ width: `${penaltyPercent}%` }}
        className="bg-amber-500/80 hover:bg-amber-500 transition-all flex items-center pl-2 text-[9px] text-[#09090b] font-bold"
        title="Penalty"
        >
        {penaltyPercent > 10 && "Forfeit"}
        </div>
        </div>
        </div>
      );
    })}
    </div>

    {/* Legend indicators */}
    <div className="flex gap-4 mt-8 pt-4 border-t border-zinc-800/60 justify-center">
    <div className="flex items-center gap-1.5 text-xs">
    <span className="w-3 h-3 bg-blue-500 rounded" />
    <span className="text-zinc-400">Regular Court Bookings</span>
    </div>
    <div className="flex items-center gap-1.5 text-xs">
    <span className="w-3 h-3 bg-amber-500 rounded" />
    <span className="text-zinc-400">No-Show Forfeit Seizure</span>
    </div>
    </div>
    </div>

    {/* Metric Details Panel (4 Columns) */}
    <div className="lg:col-span-4 space-y-6">
    <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6">
    <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
    INTEGRITY AUDIT LOGS
    </h3>

    <div className="space-y-4">
    <div className="bg-[#0e0e0e] border border-zinc-800/80 p-4 rounded-lg font-mono text-xs space-y-3">
    <div className="flex justify-between">
    <span className="text-zinc-500">MISMATCH COUNT</span>
    <span className="text-emerald-400 font-bold">0 MISMATCH</span>
    </div>
    <div className="flex justify-between">
    <span className="text-zinc-500">LEDGER SYNC STATUS</span>
    <span className="text-white">SYNCHRONIZED (100%)</span>
    </div>
    <div className="flex justify-between">
    <span className="text-zinc-500">CASHLESS GATE AUDIT</span>
    <span className="text-[#4edea3]">PASSED</span>
    </div>
    </div>

    <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded text-[11px] text-zinc-400 leading-normal">
    <strong className="text-blue-400 font-mono block mb-1 uppercase">RECON RECONCILIATION:</strong>
    Semua dana yang disita dari denda pembatalan no-show dialokasikan langsung pada metrik seizure penalty untuk menjamin kepatuhan audit.
    </div>
    </div>
    </div>
    </div>

    </div>
    </div>
    </div>
  );
}
