import React from "react";
import { ShieldAlert } from "lucide-react";

export default function PolicyBar() {
  return (
    <div className="bg-surface-hover border-y border-zinc-800 py-3.5 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-amber/10 flex items-center justify-center border border-brand-amber/20 text-brand-amber glow-amber shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-zinc-300">
              <span className="text-brand-amber font-bold uppercase font-mono tracking-wider">KEBIJAKAN NO-SHOW: </span>
              Terlambat masuk <span className="text-brand-amber font-bold">&gt;15 menit</span> menghanguskan tiket secara sepihak, dana disita 100%, dan slot sisa dirilis otomatis ke status <span className="text-brand-neon font-bold">AVAILABLE</span>.
            </p>
          </div>
        </div>
        <div className="bg-background px-3 py-1 rounded border border-zinc-800 text-micro font-mono text-zinc-500 shrink-0">
          SECURE CASHLESS PROTOCOL
        </div>
      </div>
    </div>
  );
}