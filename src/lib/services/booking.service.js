import { getSupabaseAdmin } from '../supabase';

export class BookingService {
  /**
   * Memproses pesanan baru dengan Optimistic Locking
   * Mencegah Race Condition saat 2 user mem-booking slot yang sama di detik yang sama.
   */
  static async processBooking({ venueId, slotIds, userId, paymentMethod }) {
    // Kita gunakan Supabase Admin karena proses locking butuh memotong RLS
    const supabase = getSupabaseAdmin();
    const lockTime = new Date(Date.now() + 15 * 60000).toISOString(); // Lock 15 menit
    const currentTime = new Date().toISOString();

    // 1. OPTIMISTIC LOCKING
    // Hanya update slot jika locked_until sudah kadaluarsa atau null
    const { data: lockedSlots, error: lockError } = await supabase
      .from('slots')
      .update({ 
        locked_until: lockTime, 
        locked_by: userId 
      })
      .in('id', slotIds)
      .eq('venue_id', venueId)
      .or(`locked_until.is.null,locked_until.lt.${currentTime}`)
      .select('id, price');

    if (lockError) throw new Error(`Database Error: ${lockError.message}`);

    // 2. VALIDASI INTEGRITAS
    // Jika jumlah slot yang berhasil dikunci tidak sama dengan yang diminta, 
    // berarti ada user lain yang lebih dulu mengambil salah satu slot.
    if (!lockedSlots || lockedSlots.length !== slotIds.length) {
      // Rollback: Lepaskan kunci dari slot yang sempat terambil
      if (lockedSlots && lockedSlots.length > 0) {
        const acquiredIds = lockedSlots.map(s => s.id);
        await supabase
          .from('slots')
          .update({ locked_until: null, locked_by: null })
          .in('id', acquiredIds);
      }
      throw new Error('Beberapa slot sudah diambil oleh pengguna lain. Silakan pilih ulang.');
    }

    // 3. KALKULASI & PEMBUATAN RESERVASI
    const totalAmount = lockedSlots.reduce((sum, slot) => sum + Number(slot.price), 0);

    const { data: reservation, error: reserveError } = await supabase
      .from('reservations')
      .insert({
        user_id: userId,
        venue_id: venueId,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        status: 'PENDING_PAYMENT'
      })
      .select('id')
      .single();

    if (reserveError) throw new Error(`Gagal membuat reservasi: ${reserveError.message}`);

    // 4. MAPPING RELASI SLOT - RESERVASI
    const slotMapping = slotIds.map(id => ({
      reservation_id: reservation.id,
      slot_id: id
    }));

    await supabase.from('reservation_slots').insert(slotMapping);

    // 5. INTEGRASI PAYMENT GATEWAY (Mock)
    // Di sini kamu memanggil Midtrans/Xendit/Stripe
    const paymentToken = `MOCK-TOKEN-${reservation.id}-${Date.now()}`;

    return {
      reservationId: reservation.id,
      totalAmount,
      paymentToken,
      expiresAt: lockTime
    };
  }

  /**
   * Menangani Webhook Pembayaran secara Idempotent
   * Mencegah status pesanan dieksekusi ganda jika gateway mengirim ulang webhook.
   */
  static async handlePaymentWebhook(payload) {
    const supabase = getSupabaseAdmin();
    const { order_id, transaction_status } = payload; // Asumsi struktur dari Gateway

    // 1. CEK IDEMPOTENSI
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('status')
      .eq('id', order_id)
      .single();

    if (fetchError || !reservation) throw new Error('Reservasi tidak ditemukan.');
    
    // Jika status sudah final, abaikan webhook ini (Idempotent)
    if (reservation.status === 'CONFIRMED' || reservation.status === 'FAILED') {
      return { status: 'already_processed' };
    }

    // 2. STATE MACHINE TRANSITION
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      // Pembayaran sukses: Update status dan ubah status slot jadi BOOKED
      await supabase.from('reservations').update({ status: 'CONFIRMED' }).eq('id', order_id);
      
      const { data: mapping } = await supabase
        .from('reservation_slots')
        .select('slot_id')
        .eq('reservation_id', order_id);

      if (mapping) {
        const slotIds = mapping.map(m => m.slot_id);
        await supabase
          .from('slots')
          .update({ status: 'BOOKED', locked_until: null, locked_by: null })
          .in('id', slotIds);
      }
    } else if (transaction_status === 'expire' || transaction_status === 'cancel') {
      // Pembayaran gagal/expired: Bebaskan slot
      await supabase.from('reservations').update({ status: 'FAILED' }).eq('id', order_id);
      
      const { data: mapping } = await supabase
        .from('reservation_slots')
        .select('slot_id')
        .eq('reservation_id', order_id);

      if (mapping) {
        const slotIds = mapping.map(m => m.slot_id);
        await supabase
          .from('slots')
          .update({ locked_until: null, locked_by: null })
          .in('id', slotIds);
      }
    }

    return { status: 'processed' };
  }
}