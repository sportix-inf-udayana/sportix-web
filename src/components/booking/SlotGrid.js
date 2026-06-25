import React from "react";
import { Clock, Lock } from "lucide-react";

export default function SlotGrid({ slots, selectedDate, onSlotClick }) {
  const handleSlotClick = (slot) => {
    if (slot.state === "AVAILABLE") {
      onSlotClick(slot);
    } else if (slot.state === "LOCKED") {
      // Menggunakan notifikasi standar (akan di-refactor ke komponen Toast di level atas nanti)
      alert("Slot ini sedang dikunci oleh Slot Locking Agent (SLA) untuk transaksi lain.");
    } else if (slot.state === "BOOKED") {
      alert("Slot ini telah dipesan oleh atlet lain.");
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-brand-neon" /> Available Slots ({selectedDate})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {slots.map((slot) => {
          if (slot.state === "AVAILABLE") {
            return (
              <button
                key={slot.id}
                onClick={() => handleSlotClick(slot)}
                className="bg-brand-emerald text-black p-4 rounded-xl flex flex-col items-center justify-center font-black transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.35)] glow-emerald cursor-pointer group hover:scale-[1.02]"
              >
                <span className="text-micro font-mono tracking-widest mb-1 uppercase">AVAILABLE</span>
                <span className="text-lg tracking-tight font-display">{slot.time}</span>
                <span className="text-micro font-mono mt-2 opacity-80">
                  IDR {(slot.price || 150000).toLocaleString("id-ID")}
                </span>
              </button>
            );
          } else if (slot.state === "LOCKED") {
            return (
              <button
                key={slot.id}
                onClick={() => handleSlotClick(slot)}
                className="bg-brand-amber text-black p-4 rounded-xl flex flex-col items-center justify-center font-bold animate-pulse cursor-not-allowed text-center"
              >
                <Lock className="w-4 h-4 mb-1" />
                <span className="text-xs font-mono tracking-wider">LOCKED</span>
                <span className="text-lg tracking-tight">{slot.time}</span>
              </button>
            );
          } else {
            return (
              <button
                key={slot.id}
                onClick={() => handleSlotClick(slot)}
                className="bg-surface-hover border border-zinc-800 text-zinc-500 p-4 rounded-xl flex flex-col items-center justify-center font-semibold cursor-not-allowed relative overflow-hidden"
              >
                <Lock className="w-4 h-4 mb-1 text-zinc-600" />
                <span className="text-xs font-mono tracking-wider text-zinc-600">BOOKED</span>
                <span className="text-lg tracking-tight line-through opacity-40">{slot.time}</span>
              </button>
            );
          }
        })}
      </div>
    </div>
  );
}