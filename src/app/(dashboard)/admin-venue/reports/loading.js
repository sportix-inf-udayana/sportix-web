// src/app/(dashboard)/admin-venue/reports/loading.js
export default function ReportsLoading() {
  return (
    <div className="space-y-6 w-full animate-pulse font-sans">
      <div className="border-b border-zinc-800 pb-4">
        <div className="h-8 bg-zinc-900 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-zinc-900 rounded w-1/3"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-zinc-900 border border-zinc-800 rounded-xl"></div>
        ))}
      </div>
      
      <div className="mt-8 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
        <div className="h-6 bg-zinc-800 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-zinc-950 border border-zinc-800 rounded-xl"></div>
      </div>
    </div>
  );
}