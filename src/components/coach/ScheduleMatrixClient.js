// src/components/coach/ScheduleMatrixClient.js
"use client";
import React from "react";
import { Calendar, Clock } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BOOKING_STATUS } from "@/lib/constants";

const cn = (...inputs) => twMerge(clsx(inputs));

export default function ScheduleMatrixClient({ initialSchedules }) {
  if (!initialSchedules || initialSchedules.length === 0) {
    return (
      <div className="text-center py-12 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/30 text-zinc-500 font-mono text-xs uppercase tracking-widest">
        Belum ada jadwal bimbingan yang terdaftar.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
      {initialSchedules.map((schedule) => {
        const clientName = schedule.reservations?.profiles?.full_name || "Peserta Atlet";
        const isConfirmed = schedule.status === BOOKING_STATUS.CONFIRMED || schedule.status === BOOKING_STATUS.COMPLETED;

        return (
          <div
            key={schedule.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:border-brand-emerald/50 transition-colors shadow-lg group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 group-hover:border-brand-emerald/30 transition-colors">
                  <Calendar className="w-4 h-4 text-brand-emerald" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm font-display uppercase tracking-wide truncate max-w-[150px]">{clientName}</div>
                  <div className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase mt-0.5">{schedule.booking_date}</div>
                </div>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border tracking-widest",
                isConfirmed
                  ? "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
              )}>
                {schedule.status}
              </span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60">
              <div className="flex items-center gap-2 text-zinc-300 font-mono text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>{schedule.start_time?.substring(0, 5)} - {schedule.end_time?.substring(0, 5)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">Honorarium</span>
                <span className="text-brand-emerald font-bold font-mono text-xs">Rp {Number(schedule.total_price || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}