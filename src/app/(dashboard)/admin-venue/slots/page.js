import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import SlotMatrixClient from "../../../../components/admin-venue/SlotMatrixClient";

export const dynamic = 'force-dynamic';

export default async function AdminVenueSlotsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // INTERCEPTOR: Cek apakah user sudah punya arena. Jika belum, tendang ke Onboarding!
  const { data: venue } = await supabase
    .from("venues")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!venue) {
    redirect("/admin-venue/onboarding");
  }

  // Jika lolos (baik PENDING atau VERIFIED, Layout yang urus visibilitasnya), muat data slot normal
  const today = new Date().toLocaleDateString('en-CA'); // Format YYYY-MM-DD standar UTC
  const { data: slots } = await supabase
    .from("venue_slots")
    .select(`
      id, time, status, price,
      reservations ( id, status, payment_gateway_ref, users ( full_name, phone ) )
    `)
    .eq("venue_id", venue.id)
    .eq("date", today)
    .order("time", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Timeline & Slot Matrix</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Kendali real-time ketersediaan lapangan. Sistem akan mengunci slot otomatis saat transaksi berlangsung.
          </p>
        </div>
      </div>
      <SlotMatrixClient initialSlots={slots || []} currentDate={today} venueId={venue.id} />
    </div>
  );
}