// src/app/(customer)/booking/[venueId]/_actions.js
'use server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAvailableSlots } from '@/lib/services/venue.service';
import { BookingService } from '@/lib/services/booking.service';

const getClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
};

export async function fetchAvailableSlotsAction(venueId, date) {
  if (!venueId || !date) return { error: 'Parameter tidak valid', data: null };
  
  try {
    const slots = await getAvailableSlots(getClient(), venueId, date);
    return { error: null, data: slots };
  } catch (error) {
    return { error: error.message, data: null };
  }
}

export async function submitBookingAction({ venueId, date, slots }) {
  if (!venueId || !date || !slots || slots.length === 0) {
    return { error: 'Payload tidak lengkap.' };
  }

  const { data: { user }, error: authError } = await getClient().auth.getUser();
  if (authError || !user) return { error: 'Sesi tidak valid. Silakan login kembali.' };

  try {
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