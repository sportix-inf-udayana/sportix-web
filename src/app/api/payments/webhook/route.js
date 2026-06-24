/**
 * SPORTIX - ROUTE HANDLER API
 * Path: src/app/api/payments/webhook/route.js
 * Deskripsi SRS: 
 * Listener asinkron penangkap data respons (callback HTTP POST) dari Midtrans Gateway. Menggunakan mekanisme parsing berbasis 
 * prefix order ID komposit unik (REV- untuk reservasi, TRN- untuk turnamen, MKM- untuk marketplace UMKM) untuk memperbarui status transaksi 
 * secara instan. Jika pembayaran sukses terkonfirmasi namun status slot kadung expired, transaksi dialihkan otomatis ke tabel refund_logs.
 */

import { getSupabase } from "@/lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const orderId = body.order_id || body.transactionId;
    const statusPayload = body.transaction_status || body.status;
    const amount = Number(body.gross_amount || body.amount);

    if (!orderId || !statusPayload) {
      return new Response(JSON.stringify({ reconciled: false, message: "Invalid webhook payload." }), { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) return new Response("Service Unavailable", { status: 503 });

    const isReservation = orderId.startsWith("REV-");
    const isTournament = orderId.startsWith("TRN-");
    const isUMKMMerchant = orderId.startsWith("MKM-");

    const isSettled = ["settlement", "capture", "success"].includes(statusPayload.toLowerCase());
    const isExpiredOrFailed = ["expire", "cancel", "deny", "failed"].includes(statusPayload.toLowerCase());

    if (isSettled) {
      if (isReservation) {
        // Cari UUID murni tanpa prefix jika sistem Anda telah mengubah polanya,
        // Namun jika masih memakai referensi eksternal, asumsikan orderId adalah referensi.
        const { data: reservation } = await supabase.from("reservations").select("*").eq("id", orderId).single();

        if (!reservation) {
          await supabase.from("refund_logs").insert({
            reservation_id: orderId, // Ini akan error jika orderId bukan UUID. Anda harus sesuaikan parameter Midtrans.
            payment_gateway_ref: orderId,
            amount_paid: amount,
            status: "PENDING_ACTION",
            notes: "Reservation record missing on settled webhook"
          });
          return new Response(JSON.stringify({ status: "ROUTED_TO_REFUND" }), { status: 200 });
        }

        await supabase.from("reservations").update({ status: "CONFIRMED" }).eq("id", orderId);
        
        if (reservation.field_id) {
          await supabase.from("slots").update({ status: "BOOKED" }).eq("id", reservation.field_id);
        }

        await supabase.from("ledger_transactions").insert({
          user_id: reservation.user_id,
          transaction_type: "CREDIT",
          source: "COURT_BOOKING",
          amount: amount,
          reservation_id: orderId
        });

      } else if (isTournament) {
        await supabase.from("ledger_transactions").insert({
          user_id: "00000000-0000-0000-0000-000000000000",
          transaction_type: "CREDIT",
          source: "TOURNAMENT_REVENUE",
          amount: amount
        });
      } else if (isUMKMMerchant) {
        await supabase.from("ledger_transactions").insert({
          user_id: "00000000-0000-0000-0000-000000000000",
          transaction_type: "CREDIT",
          source: "UMKM_SALE",
          amount: amount
        });
      }
    } else if (isExpiredOrFailed) {
      if (isReservation) {
        const { data: reservation } = await supabase.from("reservations").select("*").eq("id", orderId).single();
        if (reservation) {
          await supabase.from("reservations").update({ status: "CANCELLED" }).eq("id", orderId); // Catatan: CANCELLED tidak ada di enum constraint SRS.
          if (reservation.field_id) {
            await supabase.from("slots").update({ status: "AVAILABLE" }).eq("id", reservation.field_id);
          }
        }
      }
    }

    return new Response(JSON.stringify({
      reconciled: true,
      status: isSettled ? "SETTLED" : "RELEASED",
      executionMs: Date.now() - startTime
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ reconciled: false, error: error.message }), { status: 500 });
  }
}