import { AppError } from '@/lib/api-wrapper';
import { SLOT_STATUS, BOOKING_STATUS } from '@/lib/constants';

export class AdminService {
  static async getGlobalFinancialMetrics(supabase) {
    const [
      { data: ledger, error: ledgerError },
      { count: forfeitedCount, error: forfeitError },
      { count: refundCount, error: refundError }
    ] = await Promise.all([
      supabase
        .from('ledger_transactions')
        .select('id, transaction_type, source, amount, created_at')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('status', BOOKING_STATUS.FORFEITED),
      supabase
        .from('refund_logs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'PENDING_ACTION')
    ]);

    if (ledgerError) throw new AppError(ledgerError.message, 500);
    if (forfeitError) throw new AppError(forfeitError.message, 500);
    if (refundError) throw new AppError(refundError.message, 500);

    const totalVolume = ledger
      ?.filter(tx => tx.transaction_type === 'CREDIT')
      ?.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;

    return {
      integrityMismatch: 0,
      forfeitedCount: forfeitedCount || 0,
      unprocessedRefundsCount: refundCount || 0,
      totalVolume,
      ledgerStream: ledger || []
    };
  }

  static async updateSlotStatus({ supabase, userId, slotId, targetState, expectedCurrentState }) {
    const { data: venue, error: venueErr } = await supabase
      .from('venues')
      .select('id')
      .eq('owner_id', userId)
      .single();

    if (venueErr || !venue) {
      throw new AppError('Otoritas venue tidak ditemukan atau tidak valid.', 403);
    }

    const isAvailable = targetState === SLOT_STATUS.AVAILABLE;
    
    const updatePayload = {
      status: targetState,
      ...(isAvailable && { locked_until: null, reservation_id: null, locked_by: null })
    };

    let updateQuery = supabase
      .from('slots')
      .update(updatePayload)
      .eq('id', slotId)
      .eq('venue_id', venue.id)
      .select('id, reservation_id')
      .single();

    if (expectedCurrentState) {
      updateQuery = updateQuery.eq('status', expectedCurrentState);
    }

    const { data: updatedSlot, error: updateErr } = await updateQuery;

    if (updateErr || !updatedSlot) {
      throw new AppError('Gagal memperbarui slot. Terjadi Race Condition atau percobaan Bypass IDOR.', 409);
    }

    if (expectedCurrentState === SLOT_STATUS.BOOKED && isAvailable && updatedSlot.reservation_id) {
      await supabase
        .from('reservations')
        .update({ status: BOOKING_STATUS.CANCELLED_BY_ADMIN })
        .eq('id', updatedSlot.reservation_id);
    }

    return { message: `Status slot dikunci menjadi ${targetState}.` };
  }
}