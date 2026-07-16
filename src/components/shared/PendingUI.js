// src/components/shared/PendingUI.js
import React from "react";
import { Clock } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

export default function PendingUI({ title = "Pending Verification", description, message }) {
  const displayMessage = description || message || "Pengajuan Anda sedang ditinjau oleh sistem dan Super Admin.";
  
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-white font-sans relative w-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-sm w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl relative z-10">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-6 shadow-inner">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        
        <h2 className="text-lg font-black font-display uppercase tracking-wide text-white mb-2">
          {title}
        </h2>
        
        <p className="text-zinc-400 text-xs font-mono tracking-wide mb-8 leading-relaxed">
          {displayMessage}
        </p>
        
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}