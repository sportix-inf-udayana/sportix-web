import React from "react";

export default function DashboardFooter() {
  return (
    <footer className="w-full py-8 mt-auto border-t border-zinc-900 bg-zinc-950 text-center font-sans">
      <p className="text-[10px] font-mono font-bold tracking-widest text-zinc-600 uppercase">
        &copy; {new Date().getFullYear()} SPORTIX MANAGEMENT SYSTEM &middot; INTERNAL USE ONLY
      </p>
      <div className="mt-2 text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
        SECURE | ENCRYPTED | AUTONOMOUS
      </div>
    </footer>
  );
}