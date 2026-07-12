import { AppError } from '@/lib/api-wrapper';
import { SLOT_STATUS } from '@/lib/constants';

export class AdminService {
  static async getGlobalFinancialMetrics(supabase) {
    try {
      // EKSEKUSI PARALEL: Jangan biarkan Node.js menunggu query satu per satu
      const [
        { data: ledger, error: ledgerError },
      { count: forfeitedCount, error: forfeitError },
      { count: refundCount, error: refundError }
    ] = await Promise.all([
      supabase
        .from("ledger_transactions")
        .select("id, transaction_type, source, amount, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("reservations")
        .select("id", { count: 'exact', head: true })
        .eq("status", "FORFEITED"),
      supabase
        .from("refund_logs")
        .select("id", { count: 'exact', head: true })
        .eq("status", "PENDING_ACTION")
    ]);

    if (ledgerError) throw ledgerError;
    if (forfeitError) throw forfeitError;
    if (refundError) throw refundError;

    // TODO: Di masa depan, pindahkan logika ini ke PostgreSQL Function (RPC) 
    // agar Node.js tidak perlu melooping ratusan baris data untuk mencari sum.
    const totalVolume = ledger
      ?.filter(tx => tx.transaction_type === "CREDIT")
      ?.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;

    return {
      integrityMismatch: 0, 
      forfeitedCount: forfeitedCount || 0,
      unprocessedRefundsCount: refundCount || 0,
      totalVolume,
      ledgerStream: ledger || []
    };
  } catch (error) {
    console.error("[AdminService] Global Financial Metrics Fetch Error:", error.message);
    throw error; // Lempar ke API Wrapper agar ditangani secara standar
  }
  }

  static async updateSlotStatus({ supabase, userId, slotId, targetState, expectedCurrentState }) {
      // 1. Dapatkan Venue ID milik admin yang sedang login
      // Ini adalah langkah krusial untuk mencegah IDOR
      const { data: venue, error: venueErr } = await supabase
        .from("venues")
        .select("id")
        .eq("owner_id", userId)
        .single();

      if (venueErr || !venue) {
        throw new AppError("Otoritas venue tidak ditemukan atau tidak valid.", 403);
      }

      const isAvailable = targetState === SLOT_STATUS.AVAILABLE;
      
      const updatePayload = {
        status: targetState,
        ...(isAvailable && { locked_until: null, reservation_id: null, locked_by: null })
      };

      // 2. ATOMIC UPDATE & EXPLICIT ISOLATION
      // Kita langsung mencoba meng-update dengan mensyaratkan venue_id dan status saat ini
      let updateQuery = supabase
        .from("slots")
        .update(updatePayload)
        .eq("id", slotId)
        .eq("venue_id", venue.id) // PROTEKSI IDOR DI LEVEL DB
        .select("id, reservation_id")
        .single();

      if (expectedCurrentState) {
        // PROTEKSI TOCTOU: Update gagal jika status di DB sudah berubah
        updateQuery = updateQuery.eq("status", expectedCurrentState);
      }

      const { data: updatedSlot, error: updateErr } = await updateQuery;

      // Jika update gagal (tidak ada baris yang dikembalikan), berarti ada dua kemungkinan:
      // a. Slot bukan milik venue admin ini (Mencoba Bypass IDOR)
      // b. Status slot tidak sesuai ekspektasi (Terjadi Race Condition)
      if (updateErr || !updatedSlot) {
        throw new AppError("Gagal memperbarui slot. Pastikan slot ini milik Anda dan belum diubah oleh proses lain.", 409);
      }

      // 3. Otomatisasi pembatalan reservasi jika rilis paksa
      // Dalam skenario ideal, ini dilakukan dengan Database Trigger/RPC.
      // Karena kita tidak menyentuh database, kita lakukan secara sekuensial.
      if (expectedCurrentState === 'BOOKED' && isAvailable && updatedSlot.reservation_id) {
        await supabase
          .from("reservations")
          .update({ status: 'CANCELLED_BY_ADMIN' })
          .eq("id", updatedSlot.reservation_id);
      }

      return { message: `Status slot dikunci menjadi ${targetState}.` };
    }
  };