// src/components/dashboard/DashboardFooter.js
import React from "react";

export default function DashboardFooter() {
  return (
    <footer className="w-full py-8 mt-auto border-t border-zinc-900 bg-zinc-950 text-center font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
      <p className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
        &copy; {new Date().getFullYear()} SPORTIX MANAGEMENT SYSTEM &middot; INTERNAL USE ONLY
      </p>
      <div className="mt-2 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
        SECURE | ENCRYPTED | AUTONOMOUS
      </div>
    </footer>
  );
}