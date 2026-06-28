"use client";

import React, { useState } from "react";
import { User, CheckCircle, Calendar } from "lucide-react";

export default function ScheduleMatrixClient({ schedules }) {
  const [processingId, setProcessingId] = useState(null);

  const handleVerify = async (scheduleId) => {
    // Ruang kosong untuk integrasi API mutasi (contoh: /api/coaches/verify) di masa depan
    setProcessingId(scheduleId);
    console.log(`Menginisiasi verifikasi kehadiran untuk ID: ${scheduleId}`);
    setTimeout(() => setProcessingId(null), 1000); // Simulasi jaringan
  };

  return (
    <div className="bg-surface border border-zinc-800 rounded-xl p-6">
      <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-1.5">
        <Calendar className="w-4 h-4 text-brand-amber" /> ACTIVE SESSION MATRIX (LIVE DB)
      </h3>

      {schedules && schedules.length > 0 ? (
        <div className="space-y-4">
          {schedules.map((cs) => {
            const isCompleted = cs.status === "COMPLETED";
            const isProcessing = processingId === cs.id;

            return (
              <div 
                key={cs.id}
                className={`bg-surface-elevated border p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${isProcessing ? 'opacity-50 border-brand-neon' : 'border-zinc-800/60 hover:border-zinc-700/80'}`}
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-brand-amber bg-brand-amber/10 border border-brand-amber/20 px-2 py-0.5 rounded">
                      {cs.booking_date} | {cs.start_time.substring(0,5)} - {cs.end_time.substring(0,5)}
                    </span>
                    <span className={`text-micro font-mono font-bold uppercase ${isCompleted ? "text-brand-emerald" : "text-brand-neon"}`}>
                      {cs.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2">Private Training Session</h4>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Siswa: <strong className="text-zinc-300">{cs.users?.full_name || "Unknown"}</strong></span>
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-zinc-800/60 pt-3 md:pt-0">
                  {isCompleted ? (
                    <span className="text-micro font-mono text-brand-emerald flex items-center gap-1 uppercase bg-brand-emerald/10 border border-brand-emerald/30 px-3 py-1.5 rounded">
                      <CheckCircle className="w-3.5 h-3.5" /> VERIFIED
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleVerify(cs.id)}
                      disabled={isProcessing}
                      className="bg-brand-neon hover:bg-brand-emerald text-black font-mono font-bold text-micro px-3.5 py-1.5 rounded transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? "PROCESSING..." : "VERIFY ATTENDANCE"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border border-zinc-800 border-dashed rounded-lg text-zinc-500 font-mono text-xs">
          Tidak ada jadwal pelatihan aktif untuk hari ini.
        </div>
      )}
    </div>
  );
}