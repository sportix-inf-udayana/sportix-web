import React from "react";
import { Calendar } from "lucide-react";

export default function DateCarousel({ dates, selectedDate, onSelectDate }) {
  return (
    <div className="glass-panel rounded-2xl p-4 mb-8">
      <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-brand-neon" /> SELECT PLAY DATE
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {dates.map((d) => (
          <button
            key={d.label}
            onClick={() => onSelectDate(d.label)}
            className={`flex flex-col items-center justify-between p-3 rounded-lg border transition-all duration-200 shrink-0 min-w-[70px] cursor-pointer ${
              selectedDate === d.label
                ? "bg-surface-elevated border-brand-emerald text-white"
                : "bg-surface border-zinc-800/60 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <span className="text-micro font-mono uppercase tracking-widest">{d.day}</span>
            <span className="text-lg font-bold my-1">{d.num}</span>
            <span className="text-micro font-mono tracking-tighter text-zinc-500">{d.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}