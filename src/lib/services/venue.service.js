import { supabase } from '@/lib/supabase'; // Pastikan ini aman untuk environment server

export async function getAvailableSlots(venueId, date) {
  if (!venueId || !date) return [];

  try {
    // Contoh logika: Mengambil slot yang tersedia dari tabel 'slots'
    // Logika ini bergantung pada schema Supabase kamu (misal: join dengan tabel bookings)
    const { data: slots, error } = await supabase
      .from('slots')
      .select('id, start_time, end_time, is_booked, price')
      .eq('venue_id', venueId)
      .eq('date', date)
      .eq('is_booked', false); // Hanya ambil yang belum dibooking

    if (error) {
      console.error(`[Service Error] getAvailableSlots:`, error.message);
      return [];
    }

    return slots || [];
  } catch (err) {
    console.error(`[Service Exception] getAvailableSlots:`, err);
    return [];
  }
}