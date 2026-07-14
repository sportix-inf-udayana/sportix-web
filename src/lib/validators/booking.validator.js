import { z } from 'zod';
import { AppError } from '@/lib/api-wrapper';

const bookingSchema = z.object({
  venueId: z.string().uuid('Identitas venue tidak valid.'),
  slotIds: z.array(z.string().uuid('Format slot tidak valid.')).min(1, 'Pilih minimal satu slot waktu.'),
  userId: z.string().uuid('Sesi pengguna tidak valid.'),
  paymentMethod: z.string().optional()
});

export const validateBookingPayload = (data) => {
  const parsed = bookingSchema.safeParse(data);
  
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }
  
  return parsed.data;
};