import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import BookingClient from "../../../../components/booking/BookingClient";
import { getVenueDetail } from "../../../../lib/services/customer.service";

export const dynamic = 'force-dynamic';

export default async function BookingPage({ params }) {
  const { venueId } = params;
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  // Ambil data menggunakan Service
  const { data: venue, error: venueError } = await getVenueDetail(supabase, venueId);

  if (venueError || !venue || venue.status !== "APPROVED") {
    redirect(`/venues/${venueId}?error=unavailable`);
  }

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 px-4 sm:px-6 pb-20">
      <BookingClient venue={venue} user={user} />
    </div>
  );
}