// src/app/api/booking/route.js
import { withApiHandler } from '@/lib/api-wrapper';
import { BookingService } from '@/lib/services/booking.service';
import { validateBookingPayload } from '@/lib/validators/booking.validator';

export const POST = withApiHandler(async (req) => {
  const rawBody = await req.json();

  // 1. Delegasikan validasi ke layer terpisah. 
  // Jika gagal, fungsi ini akan otomatis melempar AppError 400.
  const validatedData = validateBookingPayload(rawBody);

  // 2. Lempar ke Service Layer
  const bookingResult = await BookingService.processBooking(validatedData);

  // 3. Return ke klien
  return bookingResult;
});