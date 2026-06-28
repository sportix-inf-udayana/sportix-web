import React from "react";

export default function SlotGrid({ slots, onSelectSlot }) {
  // Fungsi helper untuk mendapatkan warna berdasarkan status
  const getStatusStyle = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-brand-emerald hover:bg-brand-emerald/90 cursor-pointer";
      case "LOCKED":
        return "bg-brand-amber animate-pulse cursor-not-allowed";
      case "BOOKED":
        return "bg-brand-slate cursor-not-allowed";
      default:
        return "bg-surface-elevated";
    }
  };

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
      {slots.map((slot) => (
        <button
          key={slot.id}
          disabled={slot.status !== "AVAILABLE"}
          onClick={() => onSelectSlot(slot)}
          className={`
            p-3 rounded-lg text-micro font-medium transition-all duration-300
            ${getStatusStyle(slot.status)}
            text-white shadow-sm border border-white/5
          `}
        >
          {slot.start_time.substring(0, 5)}
        </button>
      ))}
    </div>
  );
}