// src/app/api/booking/route.js
import { z } from 'zod';
import { withAuthAndCatch } from '@/lib/api-wrapper';
import { BookingService } from '@/lib/services/booking.service';

const bookingSchema = z.object({
  venueId: z.string().uuid(),
  slotIds: z.array(z.string().uuid()).min(1)
});

export const POST = withAuthAndCatch(async (req, { user }) => {
  const payload = bookingSchema.parse(await req.json());
  
  return await BookingService.processBooking({
    venueId: payload.venueId,
    slotIds: payload.slotIds,
    userId: user.id
  });
});