import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { AlertTriangle } from "lucide-react";

// Path relatif murni sesuai arsitektur
import { getOwnerVenue } from "../../../../lib/services/admin.service";
import AdminVenueHeader from "../../../../components/admin-venue/AdminVenueHeader";
import ScannerClient from "../../../../components/admin-venue/ScannerClient";

export const dynamic = 'force-dynamic';

export default async function AdminScanPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return <div className="p-8 text-red-500 font-mono text-center">Akses Ditolak.</div>;

  // Memanfaatkan layanan data yang sama dengan modul SlotMatrix
  const { data: venue } = await getOwnerVenue(supabase, user.id);

  if (!venue) {
    return (
      <div className="p-8 text-center border border-red-500/30 bg-red-500/10 rounded-xl m-8">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-white font-mono text-sm">Venue tidak ditemukan. Sistem pemindai dinonaktifkan.</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans select-none">
      <AdminVenueHeader venueName={venue.name} />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white font-display">Live Ticket Scanner</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Validasi token E-Ticket UUID riil dari basis data. Pastikan jaringan internet Anda stabil.
          </p>
        </div>

        {/* Delegasi interaktivitas murni ke modul Client */}
        <ScannerClient />
      </div>
    </div>
  );
}