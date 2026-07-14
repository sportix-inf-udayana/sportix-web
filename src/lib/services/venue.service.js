import { AppError } from '@/lib/api-wrapper';
import { SLOT_STATUS } from '@/lib/constants';

export async function getAvailableSlots(supabase, venueId, date) {
  if (!venueId || !date) return [];

  const { data: slots, error } = await supabase
    .from('slots')
    .select('id, start_time, end_time, status, price')
    .eq('venue_id', venueId)
    .eq('slot_date', date)
    .eq('status', SLOT_STATUS.AVAILABLE)
    .order('start_time', { ascending: true });

  if (error) {
    throw new AppError(`Gagal mengambil slot: ${error.message}`, 500);
  }

  return slots || [];
}