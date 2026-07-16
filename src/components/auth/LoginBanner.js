// src/components/auth/LoginBanner.js
import React from "react";
import { ShieldCheck } from "lucide-react";

export default function LoginBanner({ title = "System Access", subtitle = "Authenticate to continue" }) {
  return (
    <header className="mb-8 text-center flex flex-col items-center">
      <div className="w-14 h-14 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald mb-5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
        <ShieldCheck className="w-7 h-7" />
      </div>
      <h1 className="text-2xl font-black text-white mb-2 font-display uppercase tracking-tight">{title}</h1>
      <p className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">{subtitle}</p>
    </header>
  );
}