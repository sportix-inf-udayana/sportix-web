/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (dashboard)
 * Path: src/app/(dashboard)/coach/schedule/page.js
 * Deskripsi SRS: 
 * Kalender jadwal taktil visual bagi mitra pelatih/instruktur olahraga. Berfungsi untuk mengonfigurasi slot ketersediaan mengajar, 
 * memantau distribusi jam latih privat, melihat daftar siswa aktif, serta memantau integrasi reservasi lapangan tempat mengajar.
 */

"use client";

import React, { useState } from "react";
import { 
  Award, 
  TrendingUp, 
  Calendar, 
  Clock, 
  ArrowRight, 
  User, 
  DollarSign,
  Briefcase,
  AlertCircle
} from "lucide-react";

export default function CoachSchedulePage() {
  const [balance, setBalance] = useState(4500000);
  
  const schedules = [
    { id: "cs1", time: "07:00 - 08:30", student: "Agus Wijaya", status: "COMPLETED", session: "Futsal Core Drills" },
    { id: "cs2", time: "10:00 - 11:30", student: "Made Sukarta", status: "UPCOMING", session: "Tactical Positioning 101" },
    { id: "cs3", time: "14:00 - 15:30", student: "Nyoman Gede", status: "UPCOMING", session: "Stamina Interval Circuit" },
    { id: "cs4", time: "16:00 - 17:30", student: "Wayan Sudarma", status: "COMPLETED", session: "Striker Finishing Class" }
  ];

  const recentActivity = [
    { id: "act-1", desc: "Sesi selesai dengan Wayan Sudarma", amount: "Rp 500,000", time: "Kemarin, 17:30" },
    { id: "act-2", desc: "Sesi selesai dengan Agus Wijaya", amount: "Rp 500,000", time: "Hari ini, 08:30" },
    { id: "act-3", desc: "Biaya platform dipotong 10%", amount: "-Rp 100,000", time: "Hari ini, 09:00" }
  ];

  const navigateToWallet = () => {
    window.location.hash = "/coach/wallet";
    if (window.__sportixNavigate) {
      window.__sportixNavigate("/coach/wallet");
    }
  };

  return (
    <div className="bg-[#09090b] text-[#e5e2e1] min-h-screen pb-16 font-sans select-none">
      
      {/* Top Header Container */}
      <div className="border-b border-zinc-800 bg-[#0e0e0e] py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 block leading-none">TRAINER COMMAND CENTER</span>
              <h1 className="text-2xl font-black text-white">Coach Command Center</h1>
            </div>
          </div>

          {/* Balance card with Withdraw button */}
          <div className="bg-[#131313] border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-6 min-w-[300px]">
            <div>
              <span className="text-[9px] font-mono text-zinc-500 block uppercase">AVAILABLE BALANCE</span>
              <span className="text-xl font-mono font-black text-[#4edea3]">
                Rp {balance.toLocaleString("id-ID")}
              </span>
            </div>
            <button 
              onClick={navigateToWallet}
              className="bg-[#4edea3] hover:bg-[#3cd094] text-[#003824] font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <span>WITHDRAW</span>
              <DollarSign className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white">Daily Training Matrix &amp; Schedule</h2>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Kelola sesi latihan private berkinerja tinggi bersama atlet Anda. Sinkronisasi kehadiran dan pantau pencairan saldo dompet secara real-time.
          </p>
        </div>

        {/* Workspace Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Schedule Matrix list (8 columns) */}
          <div className="lg:col-span-8 bg-[#131313] border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-500" /> ACTIVE SESSION MATRIX (TODAY)
            </h3>

            <div className="space-y-4">
              {schedules.map((cs) => {
                const isCompleted = cs.status === "COMPLETED";
                return (
                  <div 
                    key={cs.id}
                    className="bg-[#0e0e0e] border border-zinc-800/60 hover:border-zinc-700/80 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                          {cs.time}
                        </span>
                        <span className={`text-[10px] font-mono font-bold uppercase ${isCompleted ? "text-zinc-500" : "text-[#4edea3]"}`}>
                          {cs.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-2">
                        {cs.session}
                      </h4>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Siswa: <strong className="text-zinc-300">{cs.student}</strong></span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-zinc-800/60 pt-3 md:pt-0">
                      {isCompleted ? (
                        <span className="text-[10px] font-mono text-zinc-500 uppercase bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded">
                          ✓ SESSION EARNED
                        </span>
                      ) : (
                        <button
                          onClick={() => alert(`Absensi masuk untuk ${cs.student} berhasil diverifikasi!`)}
                          className="bg-[#4edea3]/10 hover:bg-[#4edea3] border border-[#4edea3]/30 hover:border-transparent text-[#4edea3] hover:text-[#003824] font-mono font-bold text-[10px] px-3.5 py-1.5 rounded transition-all"
                        >
                          VERIFY ATTENDANCE
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Feed & Forfeit Warning (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Recent Activity Log */}
            <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
                RECENT WALLET ACTIVITY
              </h3>
              <div className="space-y-4 font-mono text-xs">
                {recentActivity.map((act) => (
                  <div key={act.id} className="border-b border-zinc-800/80 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-zinc-300 font-sans text-xs">{act.desc}</span>
                      <span className={`font-bold ${act.amount.startsWith("-") ? "text-red-400" : "text-[#4edea3]"}`}>
                        {act.amount}
                      </span>
                    </div>
                    <span className="text-[9px] text-zinc-600 block">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strict Penalty Warning Info block */}
            <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-xl">
              <div className="flex gap-2 text-amber-500 mb-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <h4 className="text-xs font-bold uppercase font-mono tracking-wide leading-none">
                  Forfeit No-Show Rules
                </h4>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Jika murid Anda terlambat datang <span className="text-amber-400 font-bold">&gt;15 menit</span> tanpa konfirmasi tertulis, sesi Anda tetap dibayarkan 100% dan durasi slot sisa dilepas kembali otomatis ke sistem marketplace.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}