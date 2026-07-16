// src/components/booking/DateCarousel.js
import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

export default function DateCarousel({ selectedDate, onSelectDate }) {
  const dates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      dateNum: d.getDate(),
      monthName: d.toLocaleDateString('id-ID', { month: 'short' })
    };
  });

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none snap-x font-sans">
      {dates.map((d, idx) => {
        const isSelected = selectedDate === d.full;
        return (
          <button
            key={idx}
            onClick={() => onSelectDate(d.full)}
            className={cn(
              "snap-start shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all cursor-pointer font-mono",
              isSelected
                ? "bg-brand-emerald text-black border-brand-emerald shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-105"
                : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
            )}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider mb-1">{d.dayName}</span>
            <span className="text-xl font-black font-display leading-none">{d.dateNum}</span>
            <span className="text-[10px] uppercase tracking-wider mt-1">{d.monthName}</span>
          </button>
        );
      })}
    </div>
  );
}