// src/app/(dashboard)/admin-venue/loading.js
import React from "react";
import { Loader2, Server } from "lucide-react";

export default function AdminVenueLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full font-sans">
      <Server className="w-8 h-8 mb-4 text-zinc-800" />
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
      <p className="text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-widest animate-pulse">
        MENGAKSES VENUE COMMAND CENTER...
      </p>
    </div>
  );
}