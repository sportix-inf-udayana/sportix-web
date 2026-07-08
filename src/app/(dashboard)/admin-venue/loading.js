import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-zinc-500 font-sans w-full">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-xs font-mono font-bold tracking-widest uppercase">Membuka Akses Modul...</p>
    </div>
  );
}