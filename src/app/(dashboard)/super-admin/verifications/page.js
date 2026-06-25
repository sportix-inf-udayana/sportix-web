import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { Shield, TrendingUp, Sliders, AlertTriangle } from "lucide-react";
import VerificationClient from "../../../../components/super-admin/VerificationClient";

export default async function SuperAdminVerificationsPage() {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
      },
    }
  );

  // 1. Verifikasi Lapis Server Edge
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return <div className="p-8 text-red-500 font-mono text-center">Sesi Ilegal. Akses Ditolak.</div>;
  }

  // 2. Tarik Data Nyata (Real Database Fetching)
  // Hanya ambil venue yang berstatus PENDING
  const { data: pendingVenues, error: fetchErr } = await supabase
    .from("venues")
    .select("id, name, address, status, owner_id")
    .eq("status", "PENDING")
    .order("created_at", { ascending: true });

  if (fetchErr) {
    return (
      <div className="max-w-7xl mx-auto p-6 mt-10 text-center border border-red-500/30 bg-red-500/10 rounded-xl">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-white font-mono text-sm">Gagal memuat koneksi ke database master.</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans select-none">
      
      {/* Top Header & Navigation Switch */}
      <div className="border-b border-zinc-800 bg-surface-elevated sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-micro font-mono text-zinc-500 block leading-none">SUPER COMMAND SUITE</span>
              <h2 className="text-base font-black text-white font-display">Super Admin Console</h2>
            </div>
          </div>

          <div className="flex bg-surface border border-zinc-800/80 p-1 rounded-lg">
            <Link 
              href="/super-admin/verifications"
              className="bg-surface-hover text-white px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-800"
            >
              <Sliders className="w-3.5 h-3.5 text-red-400" />
              <span>ONBOARDING QUEUE</span>
            </Link>
            <Link 
              href="/super-admin/audits"
              className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>GLOBAL LEDGER</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white font-display">Stadium Onboarding Queue</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Data disinkronisasi langsung secara real-time dari database master PostgreSQL. Setujui atau tolak izin operasional ekosistem di bawah ini.
          </p>
        </div>

        {/* Delegasi Interaksi ke Client Component */}
        <VerificationClient initialVenues={pendingVenues || []} />
        
      </div>
    </div>
  );
}