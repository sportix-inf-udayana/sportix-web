"use client";

import React from "react";
import { Calendar, User, Clock } from "lucide-react";

export default function ScheduleMatrixClient({ schedules }) {
  if (!schedules || schedules.length === 0) {
    return (
      <div className="text-center py-12 border border-brand-slate/20 border-dashed rounded-lg text-brand-slate font-mono text-xs">
        Belum ada jadwal bimbingan yang terdaftar.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => (
        <div 
          key={schedule.id}
          className="bg-surface-elevated border border-brand-slate/20 rounded-lg p-4 flex items-center justify-between hover:border-brand-slate/50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-brand-emerald/10 p-2 rounded-lg border border-brand-emerald/20">
              <Calendar className="w-5 h-5 text-brand-emerald" />
            </div>
            <div>
              <div className="text-white font-bold text-sm font-sans">{schedule.users?.full_name || "Peserta"}</div>
              <div className="text-brand-slate text-xs font-mono">{schedule.booking_date}</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-brand-slate font-mono text-xs">
              <Clock className="w-4 h-4" />
              <span>{schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}</span>
            </div>
            <span className={`px-2 py-1 rounded text-micro font-mono font-bold uppercase ${
              schedule.status === "CONFIRMED" 
                ? "bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20"
                : "bg-brand-slate/10 text-brand-slate border border-brand-slate/20"
            }`}>
              {schedule.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}