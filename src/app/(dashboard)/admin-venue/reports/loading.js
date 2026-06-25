import React from "react";

export default function LoadingReports() {
  return (
    <div className="max-w-7xl mx-auto px-6 mt-8 animate-pulse">
      <div className="h-8 w-64 bg-zinc-800 rounded mb-2"></div>
      <div className="h-4 w-96 bg-zinc-800/50 rounded mb-8"></div>

      {/* Skeleton untuk Kartu Ringkasan (Summary Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-elevated border border-zinc-800 p-6 rounded-2xl h-32 flex flex-col justify-between">
            <div className="h-4 w-24 bg-zinc-700 rounded"></div>
            <div className="h-8 w-32 bg-zinc-700 rounded mt-4"></div>
          </div>
        ))}
      </div>

      {/* Skeleton untuk Tabel Laporan */}
      <div className="bg-surface-elevated border border-zinc-800 p-6 rounded-2xl h-96">
        <div className="h-6 w-48 bg-zinc-700 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full bg-zinc-800/50 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}