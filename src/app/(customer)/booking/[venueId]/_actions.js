'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAvailableSlots } from '@/lib/services/venue.service';
import { createBookingTransaction } from '@/lib/services/booking.service';

export async function fetchAvailableSlotsAction(venueId, date) {
  if (!venueId || !date) {
    return { error: 'Invalid parameters', data: null };
  }
  const slots = await getAvailableSlots(venueId, date);
  return { error: null, data: slots };
}

export async function submitBookingAction({ venueId, date, slots }) {
  // 1. Validasi Autentikasi Super Ketat
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: 'Sesi tidak valid. Silakan login kembali.' };
  }

  // 2. Validasi Input Dasar
  if (!venueId || !date || !slots || slots.length === 0) {
    return { error: 'Data booking tidak lengkap.' };
  }

  // 3. Eksekusi Service
  const result = await createBookingTransaction({
    userId: user.id,
    venueId,
    date,
    slotIds: slots
  });

  if (result.error) {
    return { error: result.error };
  }

  // 4. Redirect ke halaman pembayaran jika sukses
  // (Pastikan struktur folder payment ini ada nantinya)
  redirect(`/payment/${result.bookingId}`);
}