// src/app/api/tournaments/route.js
import { withAuthAndCatch, AppError } from '@/lib/api-wrapper';

export const POST = withAuthAndCatch(async () => {
  throw new AppError('Modul turnamen belum tersedia pada skema database.', 501);
});

export const GET = withAuthAndCatch(async () => {
  return [];
});