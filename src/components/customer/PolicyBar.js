import React from "react";
import { ShieldAlert } from "lucide-react";

export default function PolicyBar() {
  return (
    <div className="bg-amber-950/10 border-y border-amber-900/30 py-4 px-6 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 shrink-0 shadow-sm">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <span className="text-amber-500 font-bold uppercase font-mono tracking-wider">KEBIJAKAN NO-SHOW: </span>
              Terlambat masuk <span className="text-amber-500 font-bold">&gt;15 menit</span> menghanguskan tiket secara sepihak, dana disita 100%, dan slot sisa dirilis otomatis ke status <span className="text-brand-emerald font-bold">AVAILABLE</span>.
            </p>
          </div>
        </div>

        <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-[10px] font-bold font-mono tracking-widest text-zinc-500 shrink-0 uppercase shadow-inner">
          Secure Cashless Protocol
        </div>
        
      </div>
    </div>
  );
}