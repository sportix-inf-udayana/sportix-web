import React from "react";
import Link from "next/link";
import { Activity, BarChart4, ScanBarcode, Grid } from "lucide-react";

export default function AdminVenueHeader({ venueName }) {
  return (
    <div className="border-b border-zinc-800 bg-surface-elevated sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-micro font-mono text-zinc-500 block leading-none">PARTNER SUITE</span>
            <h2 className="text-base font-black text-white font-display">{venueName} Command Center</h2>
          </div>
        </div>

        <div className="flex bg-surface border border-zinc-800/80 p-1 rounded-lg">
          <Link 
            href="/admin-venue/slots"
            className="bg-surface-hover text-white px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-800"
          >
            <Grid className="w-3.5 h-3.5 text-brand-neon" />
            <span>SLOT MATRIX</span>
          </Link>
          <Link 
            href="/admin-venue/scan"
            className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            <ScanBarcode className="w-3.5 h-3.5" />
            <span>SCANNER GATE</span>
          </Link>
          <Link 
            href="/admin-venue/reports"
            className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            <BarChart4 className="w-3.5 h-3.5" />
            <span>REPORTS</span>
          </Link>
        </div>
      </div>
    </div>
  );
}