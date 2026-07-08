"use client";

import React from "react";
import { Calendar, Clock } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

export default function ScheduleMatrixClient({ initialSchedules }) {
  if (!initialSchedules || initialSchedules.length === 0) {
    return (
      <div className="text-center py-12 border border-zinc-800 border-dashed rounded-lg text-zinc-500 font-mono text-xs">
        Belum ada jadwal bimbingan yang terdaftar.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {initialSchedules.map((schedule) => {
        // Akses data nested yang aman sesuai struktur API / page.js
        const clientName = schedule.reservations?.users?.raw_user_meta_data?.full_name || "Peserta Atlet";
        const bookingDate = schedule.reservations?.booking_date || schedule.day_of_week;

        return (
          <div 
            key={schedule.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between hover:border-zinc-700 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-brand-emerald/10 p-2 rounded-lg border border-brand-emerald/20">
                <Calendar className="w-5 h-5 text-brand-emerald" />
              </div>
              <div>
                <div className="text-white font-bold text-sm font-sans">{clientName}</div>
                <div className="text-zinc-500 text-xs font-mono">{bookingDate}</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs">
                <Clock className="w-4 h-4" />
                <span>{schedule.start_time?.substring(0, 5)} - {schedule.end_time?.substring(0, 5)}</span>
              </div>
              <span className={cn(
                "px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border",
                schedule.status === "CONFIRMED" 
                  ? "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
              )}>
                {schedule.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}