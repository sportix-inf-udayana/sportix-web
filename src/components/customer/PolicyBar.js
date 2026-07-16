// src/components/customer/PolicyBar.js
import React from "react";
import { ShieldAlert } from "lucide-react";

export default function PolicyBar() {
  return (
    <div className="bg-amber-950/10 border-y border-amber-900/30 py-4 px-6 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed font-mono uppercase tracking-wide">
              <span className="text-amber-500 font-bold tracking-widest">SLA ENFORCEMENT: </span>
              Keterlambatan <span className="text-amber-500 font-bold">&gt;15 menit</span> memicu forfeit sepihak. Dana disita 100%, slot dirilis ke status <span className="text-brand-emerald font-bold">AVAILABLE</span>.
            </p>
          </div>
        </div>
        <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-[10px] font-bold font-mono tracking-widest text-zinc-500 shrink-0 uppercase shadow-inner">
          Autonomous Protocol
        </div>
      </div>
    </div>
  );
}