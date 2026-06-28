import React from "react";
import Link from "next/link";
import { Shield, TrendingUp, Sliders } from "lucide-react";

export default function SuperAdminHeader() {
  return (
    <div className="border-b border-zinc-800 bg-surface-elevated sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-micro font-mono text-zinc-500 block leading-none">SUPER COMMAND SUITE</span>
            <h2 className="text-base font-black text-white font-display">Super Admin Console</h2>
          </div>
        </div>

        <div className="flex bg-surface border border-zinc-800/80 p-1 rounded-lg">
          <Link 
            href="/super-admin/verifications"
            className="bg-surface-hover text-white px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-800"
          >
            <Sliders className="w-3.5 h-3.5 text-red-400" />
            <span>ONBOARDING QUEUE</span>
          </Link>
          <Link 
            href="/super-admin/audits"
            className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>GLOBAL LEDGER</span>
          </Link>
        </div>
      </div>
    </div>
  );
}