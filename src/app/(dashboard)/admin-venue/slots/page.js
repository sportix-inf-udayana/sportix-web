import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { Activity, BarChart4, ScanBarcode, Grid, AlertTriangle } from "lucide-react";
import SlotMatrixClient from "../../../../components/admin-venue/SlotMatrixClient";

export const dynamic = 'force-dynamic';

export default async function AdminSlotsPage({ searchParams }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return <div className="p-8 text-red-500 font-mono">Akses Ditolak.</div>;

  // 1. Tarik Kepemilikan Venue Mutlak
  const { data: venue } = await supabase
    .from("venues")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!venue) {
    return (
      <div className="p-8 text-center border border-red-500/30 bg-red-500/10 rounded-xl m-8">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-white font-mono text-sm">Venue tidak ditemukan. Anda belum memiliki entitas stadion yang disetujui.</p>
      </div>
    );
  }

  // Set default query parameter ke hari ini
  const targetDate = searchParams?.date || new Date().toISOString().split('T')[0];

  // 2. Tarik Data Slot Fisik Beserta Relasi Reservasinya
  const { data: slots } = await supabase
    .from("slots")
    .select(`
      id, time, status, price, locked_until,
      reservations ( id, status, payment_gateway_ref, users(full_name, phone) )
    `)
    .eq("venue_id", venue.id)
    .eq("date", targetDate)
    .order("time", { ascending: true });

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans select-none">
      {/* Top dashboard navigation bar */}
      <div className="border-b border-zinc-800 bg-surface-elevated sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-micro font-mono text-zinc-500 block leading-none">PARTNER SUITE</span>
              <h2 className="text-base font-black text-white font-display">{venue.name} Command Center</h2>
            </div>
          </div>

          <div className="flex bg-surface border border-zinc-800/80 p-1 rounded-lg">
            <Link 
              href="/admin-venue/slots"
              className="bg-surface-hover text-white px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-800"
            >
              <Grid className="w-3.5 h-3.5 text-brand-neon" />
              <span>SLOT MATRIX</span>
            </Link>
            <Link 
              href="/admin-venue/scan"
              className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <ScanBarcode className="w-3.5 h-3.5" />
              <span>SCANNER GATE</span>
            </Link>
            <Link 
              href="/admin-venue/reports"
              className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <BarChart4 className="w-3.5 h-3.5" />
              <span>REPORTS</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white font-display">Court Slot Control Matrix</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Matriks status tersinkronisasi langsung dari PostgreSQL. Operasi force-lock dan pembatalan tiket diproses melalui API mutlak.
          </p>
        </div>

        {/* Delegasikan UI interaktif dan Form API ke Client Component terpisah */}
        {/* SlotMatrixClient akan menerima data slots awal dan merender UI yang bisa berinteraksi dengan API /api/slots/manage */}
        <SlotMatrixClient 
          initialSlots={slots || []} 
          currentDate={targetDate} 
          venueId={venue.id} 
        />
      </div>
    </div>
  );
}