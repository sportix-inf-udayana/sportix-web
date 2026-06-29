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

  // 1. Validasi Sesi: Jika belum login, tendang ke gerbang login dengan parameter callback
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?callback=/booking/${venueId}`);
  }

  // 2. Tarik detail arena (Pastikan fungsi ini mengembalikan format { data, error })
  const { data: venueData, error } = await getVenueDetail(supabase, venueId);

  // 3. Fallback jika ID arena tidak valid atau data gagal ditarik
  if (error || !venueData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Arena Tidak Ditemukan</h2>
          <p className="text-brand-slate">Fasilitas yang Anda cari mungkin sedang tidak aktif atau ID tidak valid.</p>
        </div>
      </div>
    );
  }

  // 4. Render murni komponen klien
  // Header dan Footer SUDAH OTOMATIS di-render oleh src/app/(customer)/layout.js
  return (
    <div className="w-full">
      <BookingClient venue={venueData} user={user} />
    </div>
  );
}