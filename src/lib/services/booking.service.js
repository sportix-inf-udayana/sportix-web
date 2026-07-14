import { AppError } from '@/lib/api-wrapper';
import { SLOT_STATUS, BOOKING_STATUS, BUSINESS_RULES } from '@/lib/constants';
import { getSupabaseAdmin } from '@/lib/supabase';

const MIDTRANS_URL = process.env.MIDTRANS_API_URL || "https://app.sandbox.midtrans.com/snap/v1/transactions";
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY 
  ? Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64") 
  : null;

export class BookingService {
  static async processBooking({ venueId, slotIds, userId }) {
    if (!SERVER_KEY) throw new AppError("Kesalahan Konfigurasi Gateway.", 500);

    const supabase = getSupabaseAdmin();

    const { data: slots, error: fetchErr } = await supabase
      .from('slots')
      .select('id, price, status')
      .in('id', slotIds)
      .eq('venue_id', venueId);

    if (fetchErr || !slots || slots.length !== slotIds.length) {
      throw new AppError('Beberapa slot tidak ditemukan atau tidak valid.', 404);
    }

    const totalPrice = slots.reduce((acc, slot) => acc + slot.price, 0);

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

    if (resErr || !reservation) {
      throw new AppError('Sistem gagal membuat ID Booking.', 500);
    }

    const lockTime = new Date(Date.now() + BUSINESS_RULES.SLA_LOCK_MINUTES * 60000).toISOString();
    
    const { data: updatedSlots, error: lockErr } = await supabase
      .from('slots')
      .update({
        status: SLOT_STATUS.LOCKED,
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
        await supabase.from('slots')
          .update({ 
            status: SLOT_STATUS.AVAILABLE, 
            reservation_id: null, 
            locked_until: null, 
            locked_by: null 
          })
          .in('id', updatedSlots.map(s => s.id));
      }
      throw new AppError('Gagal mengamankan slot. Terjadi Race Condition.', 409);
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('email, full_name')
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
          email: userProfile?.email || "user@sportix.app", 
          first_name: userProfile?.full_name || "Customer" 
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
      await supabase.from('slots')
        .update({ 
          status: SLOT_STATUS.AVAILABLE, 
          reservation_id: null, 
          locked_until: null, 
          locked_by: null 
        })
        .eq('reservation_id', reservation.id);
        
      await supabase.from('reservations').delete().eq('id', reservation.id);
      throw new AppError("Payment Gateway menolak token.", 502);
    }

    await supabase
      .from('reservations')
      .update({ payment_gateway_ref: orderId })
      .eq('id', reservation.id);

    return { payment_token: midtransData.token, bookingId: reservation.id };
  }

  static async handlePaymentWebhook(payload) {
    const { order_id, transaction_status, fraud_status } = payload;
    if (!order_id?.startsWith('REV-')) return;

    const reservationId = order_id.split('-')[1];
    const supabase = getSupabaseAdmin();

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      if (fraud_status === 'accept' || !fraud_status) {
        const { data: res } = await supabase
          .from('reservations')
          .select('status')
          .eq('id', reservationId)
          .single();
        
        if ([BOOKING_STATUS.EXPIRED_PAID, BOOKING_STATUS.CANCELLED_BY_ADMIN, BOOKING_STATUS.FORFEITED].includes(res?.status)) {
          await supabase.from('refund_logs').insert({ 
            reservation_id: reservationId, 
            status: 'PENDING_ACTION', 
            reason: 'EXPIRED_PAID' 
          });
        } else {
          await supabase.from('reservations').update({ status: BOOKING_STATUS.CONFIRMED }).eq('id', reservationId);
          await supabase.from('slots').update({ status: SLOT_STATUS.BOOKED }).eq('reservation_id', reservationId);
        }
      }
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      const { data: res } = await supabase
        .from('reservations')
        .select('status')
        .eq('id', reservationId)
        .single();
        
      if (res?.status === BOOKING_STATUS.PENDING) {
        await supabase.from('reservations').update({ status: BOOKING_STATUS.CANCELLED_BY_ADMIN }).eq('id', reservationId);
        await supabase.from('slots')
          .update({ 
            status: SLOT_STATUS.AVAILABLE, 
            reservation_id: null, 
            locked_until: null, 
            locked_by: null 
          })
          .eq('reservation_id', reservationId);
      }
    }
  }
}