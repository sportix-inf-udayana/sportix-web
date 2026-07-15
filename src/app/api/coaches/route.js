// src/app/api/coaches/route.js
import { z } from 'zod';
import { withAuthAndCatch, AppError } from '@/lib/api-wrapper';
import { ENTITY_STATUS } from '@/lib/constants';

const bookingSchema = z.object({
  coachId: z.string().uuid(),
  reservationId: z.string().uuid(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/)
});

export const POST = withAuthAndCatch(async (req, { supabase, user }) => {
  const payload = bookingSchema.parse(await req.json());

  const { data: coach, error: coachErr } = await supabase
    .from('coaches')
    .select('price_per_hour, status')
    .eq('id', payload.coachId)
    .single();

  if (coachErr || !coach || coach.status !== ENTITY_STATUS.APPROVED) {
    throw new AppError('Pelatih tidak valid atau belum disetujui.', 404);
  }

  const { data: booking, error: insertError } = await supabase
    .from('coach_bookings')
    .insert({
      user_id: user.id,
      coach_id: payload.coachId,
      reservation_id: payload.reservationId,
      booking_date: payload.bookingDate,
      start_time: payload.startTime,
      end_time: payload.endTime,
      total_price: coach.price_per_hour,
      status: 'CONFIRMED'
    })
    .select('id')
    .single();

  if (insertError) {
    if (insertError.code === '23505') throw new AppError('Jadwal bentrok.', 409);
    throw insertError;
  }

  return { bookingId: booking.id };
});