import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

import { getVenueDetail } from "../../../../lib/services/customer.service";
import BookingClient from "../../../../components/booking/BookingClient";

export const dynamic = 'force-dynamic';

export default async function BookingPage({ params }) {
  const { venueId } = params;
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?callback=/booking/${venueId}`);
  }

  const { data: venueData, error } = await getVenueDetail(supabase, venueId);

  // FIX LUBANG BYPASS: Blokir hak akses pemesanan secara absolut jika status arena tidak bernilai APPROVED
  if (error || !venueData || venueData.status !== 'APPROVED') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-zinc-950 font-sans">
        <div className="text-center space-y-4 max-w-sm px-6">
          <h2 className="text-xl font-black text-white font-display uppercase tracking-tight">Akses Booking Ditutup</h2>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Fasilitas olahraga ini belum memenuhi kualifikasi verifikasi legalitas fisik atau sedang dinonaktifkan sementara oleh Super Admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-950">
      <BookingClient venue={venueData} user={user} />
    </div>
  );
}