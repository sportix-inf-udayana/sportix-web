import { AppError } from '@/lib/api-wrapper';

export const validateBookingPayload = (data) => {
  const { venueId, slotIds, userId, paymentMethod } = data;

  if (!venueId || typeof venueId !== 'string') {
    throw new AppError('Identitas venue tidak valid atau hilang.', 400);
  }

  if (!Array.isArray(slotIds) || slotIds.length === 0) {
    throw new AppError('Harus memilih minimal satu slot waktu.', 400);
  }

  if (!userId) {
    throw new AppError('Sesi pengguna tidak valid.', 401);
  }

  return { venueId, slotIds, userId, paymentMethod };
};