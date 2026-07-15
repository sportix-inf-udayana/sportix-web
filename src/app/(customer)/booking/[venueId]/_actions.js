'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAvailableSlots } from '@/lib/services/venue.service';
import { BookingService } from '@/lib/services/booking.service';

export async function fetchAvailableSlotsAction(venueId, date) {
  if (!venueId || !date) {
    return { error: 'Invalid parameters', data: null };
  }
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  try {
    const slots = await getAvailableSlots(supabase, venueId, date);
    return { error: null, data: slots };
  } catch (error) {
    return { error: error.message, data: null };
  }
}

export async function submitBookingAction({ venueId, date, slots }) {
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

  if (!venueId || !date || !slots || slots.length === 0) {
    return { error: 'Data booking tidak lengkap.' };
  }

  try {
    // Fungsi yang benar sesuai dengan BookingService
    const result = await BookingService.processBooking({
      userId: user.id,
      venueId,
      slotIds: slots
    });

    return { error: null, data: result };
  } catch (error) {
    return { error: error.message };
  }
}