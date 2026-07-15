// src/lib/services/booking.service.js
import { AppError } from '@/lib/api-wrapper';
import { SLOT_STATUS, BOOKING_STATUS, BUSINESS_RULES, TRANSACTION_TYPE } from '@/lib/constants';
import { getSupabaseAdmin } from '@/lib/supabase';

const MIDTRANS_URL = process.env.MIDTRANS_API_URL || "https://app.sandbox.midtrans.com/snap/v1/transactions";
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ? Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64") : null;

export class BookingService {
  static async processBooking({ venueId, slotIds, userId }) {
    if (!SERVER_KEY) throw new AppError("Gateway config error.", 500);
    const supabase = getSupabaseAdmin();

    const { data: slots, error: fetchErr } = await supabase
      .from('venue_slots')
      .select('id, price, status')
      .in('id', slotIds)
      .eq('venue_id', venueId);

    if (fetchErr || !slots || slots.length !== slotIds.length) {
      throw new AppError('Invalid or unavailable slots.', 404);
    }

    const totalPrice = slots.reduce((acc, slot) => acc + Number(slot.price), 0);

    const { data: reservation, error: resErr } = await supabase
      .from('reservations')
      .insert({
        user_id: userId,
        venue_id: venueId,
        total_price: totalPrice,
        status: BOOKING_STATUS.PENDING
      })
      .select('id')
      .single();

    if (resErr || !reservation) throw new AppError('System failed to generate reservation ID.', 500);

    const lockTime = new Date(Date.now() + BUSINESS_RULES.SLA_LOCK_MINUTES * 60000).toISOString();

    const { data: updatedSlots, error: lockErr } = await supabase
      .from('venue_slots')
      .update({
        status: SLOT_STATUS.LOCKED,
        is_available: false,
        reservation_id: reservation.id,
        locked_until: lockTime,
        locked_by: userId
      })
      .in('id', slotIds)
      .eq('status', SLOT_STATUS.AVAILABLE)
      .select('id');

    if (lockErr || !updatedSlots || updatedSlots.length !== slotIds.length) {
      await supabase.from('reservations').delete().eq('id', reservation.id);
      if (updatedSlots?.length > 0) {
        await supabase.from('venue_slots')
          .update({ status: SLOT_STATUS.AVAILABLE, is_available: true, reservation_id: null, locked_until: null, locked_by: null })
          .in('id', updatedSlots.map(s => s.id));
      }
      throw new AppError('Slot lock collision detected. Try again.', 409);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle();

    const orderId = `REV-${reservation.id}-${Date.now()}`;

    const midtransResponse = await fetch(MIDTRANS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${SERVER_KEY}`
      },
      body: JSON.stringify({
        transaction_details: { order_id: orderId, gross_amount: totalPrice },
        customer_details: {
          email: `user_${userId.substring(0,6)}@sportix.app`,
          first_name: profile?.full_name || "Customer"
        },
        expiry: {
          start_time: new Date().toISOString().replace("T", " ").substring(0, 19) + " +0800",
          unit: "minutes",
          duration: BUSINESS_RULES.SLA_LOCK_MINUTES
        }
      })
    });

    const midtransData = await midtransResponse.json();

    if (!midtransResponse.ok || !midtransData.token) {
      await supabase.from('venue_slots')
        .update({ status: SLOT_STATUS.AVAILABLE, is_available: true, reservation_id: null, locked_until: null, locked_by: null })
        .eq('reservation_id', reservation.id);
      await supabase.from('reservations').delete().eq('id', reservation.id);
      throw new AppError("Payment gateway rejected token generation.", 502);
    }

    await supabase.from('reservations').update({ payment_gateway_ref: orderId }).eq('id', reservation.id);

    return { payment_token: midtransData.token, bookingId: reservation.id };
  }

  static async handlePaymentWebhook(payload) {
    const { order_id, transaction_status, fraud_status } = payload;
    if (!order_id) return;

    const segments = order_id.split('-');
    const prefix = segments[0];
    const entityId = segments[1];
    const supabase = getSupabaseAdmin();

    if (prefix === 'REV') {
      if (['settlement', 'capture'].includes(transaction_status)) {
        if (fraud_status === 'accept' || !fraud_status) {
          const { data: res } = await supabase.from('reservations').select('status, user_id, total_price').eq('id', entityId).single();
          if (!res) return;

          if ([BOOKING_STATUS.EXPIRED_PAID, BOOKING_STATUS.CANCELLED_BY_ADMIN, BOOKING_STATUS.FORFEITED].includes(res.status)) {
            const { data: currentBalance } = await supabase.from('balances').select('amount').eq('user_id', res.user_id).single();
            const newAmount = Number(currentBalance?.amount || 0) + Number(res.total_price);
            
            await supabase.from('balances').update({ amount: newAmount, updated_at: new Date().toISOString() }).eq('user_id', res.user_id);
            await supabase.from('ledger_transactions').insert({
              user_id: res.user_id,
              transaction_type: TRANSACTION_TYPE.CREDIT,
              source: `REFUND_OVERRIDE_${order_id}`,
              amount: res.total_price
            });
          } else {
            await supabase.from('reservations').update({ status: BOOKING_STATUS.CONFIRMED }).eq('id', entityId);
            await supabase.from('venue_slots').update({ status: SLOT_STATUS.BOOKED }).eq('reservation_id', entityId);
          }
        }
      } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
        const { data: res } = await supabase.from('reservations').select('status').eq('id', entityId).single();
        if (res?.status === BOOKING_STATUS.PENDING) {
          await supabase.from('reservations').update({ status: BOOKING_STATUS.CANCELLED_BY_ADMIN }).eq('id', entityId);
          await supabase.from('venue_slots')
            .update({ status: SLOT_STATUS.AVAILABLE, is_available: true, reservation_id: null, locked_until: null, locked_by: null })
            .eq('reservation_id', entityId);
        }
      }
    } else if (prefix === 'MKM') {
      if (['settlement', 'capture'].includes(transaction_status) && (fraud_status === 'accept' || !fraud_status)) {
        await supabase.from('umkm_orders').update({ status: 'PAID' }).eq('id', entityId);
      } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
        await supabase.from('umkm_orders').update({ status: 'CANCELLED' }).eq('id', entityId);
      }
    }
  }
}