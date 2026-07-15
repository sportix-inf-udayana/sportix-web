// src/lib/services/venue.service.js
import { AppError } from '@/lib/api-wrapper';
import { SLOT_STATUS, ENTITY_STATUS } from '@/lib/constants';

export async function getAvailableSlots(supabase, venueId, date) {
  if (!venueId || !date) return [];
  
  const { data: venue, error: venueErr } = await supabase
    .from('venues')
    .select('status, is_active')
    .eq('id', venueId)
    .maybeSingle();
    
  if (venueErr || !venue || venue.status !== ENTITY_STATUS.APPROVED || !venue.is_active) {
    throw new AppError('Fasilitas tidak tersedia untuk reservasi publik.', 403);
  }

  const { data: slots, error } = await supabase
    .from('venue_slots')
    .select('id, start_time, end_time, status, price, is_available, fields!inner(name, sport_type)')
    .eq('venue_id', venueId)
    .eq('slot_date', date)
    .eq('status', SLOT_STATUS.AVAILABLE)
    .eq('is_available', true)
    .order('start_time', { ascending: true });

  if (error) {
    throw new AppError(`Gagal mengambil data operasional slot: ${error.message}`, 500);
  }

  return slots || [];
}