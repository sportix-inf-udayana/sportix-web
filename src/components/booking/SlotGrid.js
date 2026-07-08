import React from "react";
import { Lock, CheckCircle2, Clock } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

export default function SlotGrid({ slots, selectedSlot, onSelectSlot }) {
  if (!slots || slots.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center border border-zinc-800 border-dashed rounded-xl bg-zinc-950">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">TIDAK ADA JADWAL DITEMUKAN.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 font-sans">
      {slots.map((slot) => {
        const isSelected = selectedSlot?.id === slot.id;
        const isAvailable = slot.status === "AVAILABLE";
        const isLocked = slot.status === "LOCKED";
        const isBooked = slot.status === "BOOKED";

        return (
          <button
            key={slot.id}
            disabled={!isAvailable}
            onClick={() => onSelectSlot(slot)}
            className={cn(
              "p-4 rounded-xl border flex flex-col justify-between h-24 text-left font-mono transition-all relative overflow-hidden group",
              isAvailable ? "cursor-pointer hover:border-brand-emerald/50 hover:bg-zinc-800" : "cursor-not-allowed opacity-80",
              isSelected ? "bg-brand-emerald/10 border-brand-emerald shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]" : "bg-zinc-900 border-zinc-800",
              isLocked && "bg-amber-950/20 border-amber-900/30",
              isBooked && "bg-zinc-950 border-zinc-900"
            )}
          >
            <span className={cn(
              "text-sm font-bold block transition-colors",
              isSelected ? "text-brand-emerald" : isAvailable ? "text-white" : "text-zinc-600"
            )}>
              {slot.start_time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
            </span>
            
            <div className="flex items-center justify-between w-full mt-auto">
              <span className={cn(
                "text-[10px] tracking-widest uppercase font-bold transition-colors",
                isSelected ? "text-brand-emerald" : isAvailable ? "text-zinc-500 group-hover:text-zinc-400" : isLocked ? "text-amber-500" : "text-zinc-600"
              )}>
                {isSelected ? "TERPILIH" : slot.status}
              </span>
              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" />}
              {isLocked && <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
              {isBooked && <Lock className="w-3 h-3 text-zinc-700" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}