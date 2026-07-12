import { supabase } from '@/lib/supabase'; // Gunakan instance client server yang aman jika memungkinkan

export async function createBookingTransaction({ userId, venueId, date, slotIds }) {
  try {
    // 1. DOUBLE-CHECK: Pastikan slot benar-benar masih kosong di detik ini
    const { data: availableSlots, error: checkError } = await supabase
      .from('slots')
      .select('id, price')
      .in('id', slotIds)
      .eq('is_booked', false)
      .eq('date', date)
      .eq('venue_id', venueId);

    if (checkError) {
      console.error('[Booking Service] Check Error:', checkError);
      return { error: 'Gagal memverifikasi ketersediaan slot.' };
    }

    if (availableSlots.length !== slotIds.length) {
      return { error: 'Satu atau lebih slot yang kamu pilih baru saja diambil orang lain.' };
    }

    // Kalkulasi harga di server (jangan percaya kalkulasi harga dari client)
    const totalPrice = availableSlots.reduce((sum, slot) => sum + slot.price, 0);

    // 2. CREATE BOOKING: Buat record transaksi dengan status 'pending'
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        venue_id: venueId,
        booking_date: date,
        total_price: totalPrice,
        status: 'pending' 
      })
      .select('id')
      .single();

    if (bookingError) {
      console.error('[Booking Service] Insert Error:', bookingError);
      return { error: 'Sistem gagal membuat ID Booking.' };
    }

    // 3. LOCK SLOTS: Tandai slot sebagai terbuku dan tautkan ke booking_id
    const { error: updateError } = await supabase
      .from('slots')
      .update({ is_booked: true, booking_id: booking.id })
      .in('id', slotIds);

    // 4. MANUAL ROLLBACK: Jika gagal mengunci slot, hapus booking yang baru dibuat
    if (updateError) {
      console.error('[Booking Service] Update Slots Error:', updateError);
      await supabase.from('bookings').delete().eq('id', booking.id);
      return { error: 'Gagal mengamankan slot. Transaksi dibatalkan otomatis.' };
    }

    return { error: null, bookingId: booking.id };
  } catch (err) {
    console.error('[Booking Service] Exception:', err);
    return { error: 'Terjadi kesalahan sistem yang tidak terduga.' };
  }
}