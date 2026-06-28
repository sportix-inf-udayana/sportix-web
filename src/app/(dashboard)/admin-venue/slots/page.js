import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { AlertTriangle } from "lucide-react";

// Path relatif absolut sesuai struktur folder
import { getOwnerVenue, getVenueSlots } from "../../../../lib/services/admin.service";
import AdminVenueHeader from "../../../../components/admin-venue/AdminVenueHeader";
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
  if (authError || !user) return <div className="p-8 text-red-500 font-mono text-center">Akses Ditolak.</div>;

  // Pengambilan data via Data Layer
  const { data: venue } = await getOwnerVenue(supabase, user.id);

  if (!venue) {
    return (
      <div className="p-8 text-center border border-red-500/30 bg-red-500/10 rounded-xl m-8">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-white font-mono text-sm">Venue tidak ditemukan. Anda belum memiliki entitas stadion yang disetujui.</p>
      </div>
    );
  }

  const targetDate = searchParams?.date || new Date().toISOString().split('T')[0];
  const { data: slots } = await getVenueSlots(supabase, venue.id, targetDate);

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans select-none">
      <AdminVenueHeader venueName={venue.name} />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white font-display">Court Slot Control Matrix</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Matriks status tersinkronisasi langsung dari PostgreSQL. Operasi force-lock dan pembatalan tiket diproses melalui API mutlak.
          </p>
        </div>

        <SlotMatrixClient 
          initialSlots={slots || []} 
          currentDate={targetDate} 
          venueId={venue.id} 
        />
      </div>
    </div>
  );
}