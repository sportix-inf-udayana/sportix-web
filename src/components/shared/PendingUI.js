import React from "react";
import { Clock } from "lucide-react";
import LogoutButton from "../auth/LogoutButton";

export default function PendingUI({ title, description }) {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-white font-sans relative">
      <div className="max-w-sm w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center shadow-2xl relative z-10">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-5">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-base font-bold font-mono uppercase tracking-wide text-white mb-2">{title}</h2>
        <p className="text-zinc-400 text-xs leading-relaxed font-sans mb-6">{description}</p>
        <LogoutButton />
      </div>
    </div>
  );
}