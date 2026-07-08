import React from "react";

export default function LoadingReports() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 mt-2 animate-pulse">
      <div className="border-b border-zinc-800 pb-4">
        <div className="h-8 w-64 bg-zinc-800 rounded-lg mb-3"></div>
        <div className="h-4 w-96 bg-zinc-800/50 rounded-md"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-32 flex flex-col justify-between shadow-sm">
            <div className="h-3 w-32 bg-zinc-800 rounded-md"></div>
            <div className="h-8 w-40 bg-zinc-800 rounded-lg mt-4"></div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-800 bg-zinc-950">
           <div className="h-4 w-48 bg-zinc-800 rounded-md"></div>
        </div>
        <div className="p-6 space-y-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full bg-zinc-800/40 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}