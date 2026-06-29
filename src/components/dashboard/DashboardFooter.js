import React from "react";

export default function DashboardFooter() {
  return (
    <footer className="w-full py-4 mt-auto border-t border-zinc-800/50 bg-background text-center">
      <p className="text-[10px] font-mono tracking-widest text-brand-slate uppercase">
        &copy; {new Date().getFullYear()} SPORTIX MANAGEMENT SYSTEM &middot; INTERNAL USE ONLY
      </p>
    </footer>
  );
}