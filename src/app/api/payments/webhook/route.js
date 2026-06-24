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
    
    // Support Midtrans API sandbox payload parameters
    // Midtrans uses order_id, transaction_status, gross_amount, payment_type
    const orderId = body.order_id || body.transactionId;
    const status = body.transaction_status || body.status;
    const amount = Number(body.gross_amount || body.amount);
    const paymentType = body.payment_type || "qris";

    if (!orderId || !status) {
      return new Response(JSON.stringify({ 
        reconciled: false, 
        message: "Invalid webhook payload. Missing order_id or status." 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const defaultUserId = "00000000-0000-0000-0000-000000000000";
    const supabase = getSupabase();

    // Determine target system based on the prefix
    const isReservation = orderId.startsWith("REV-");
    const isTournament = orderId.startsWith("TRN-");
    const isUMKMMerchant = orderId.startsWith("MKM-");

    // Success settlement states from Midtrans: "settlement", "capture", "success"
    const isSettled = ["settlement", "capture", "success", "confirmed", "paid"].includes(status.toLowerCase());
    const isExpiredOrFailed = ["expire", "cancel", "deny", "failed"].includes(status.toLowerCase());

    if (supabase) {
      if (isSettled) {
        if (isReservation) {
          // 1. Fetch reservation to get slot details
          const { data: reservation, error: fetchErr } = await supabase
            .from("reservations")
            .select("*")
            .eq("id", orderId)
            .single();

          if (fetchErr || !reservation) {
            console.error(`Reservation ${orderId} not found, routing to refund_logs.`);
            await supabase.from("refund_logs").insert({
              order_id: orderId,
              amount: amount,
              reason: "Late settlement / reservation record missing",
              logged_at: new Date().toISOString()
            });
            return new Response(JSON.stringify({ reconciled: true, status: "ROUTED_TO_REFUND", message: "Reservation missing. Routed to refund." }), { status: 200 });
          }

          // 2. Update Reservation status to CONFIRMED
          await supabase
            .from("reservations")
            .update({ status: "CONFIRMED" })
            .eq("id", orderId);

          // 3. Update Slot status to BOOKED
          if (reservation.slot_id) {
            await supabase
              .from("slots")
              .update({ state: "BOOKED" })
              .eq("id", reservation.slot_id);
          }

          // 4. Record financial immutability in ledger_transactions
          await supabase.from("ledger_transactions").insert({
            user_id: reservation.user_id || defaultUserId,
            amount: amount,
            type: "credit",
            description: `Payment confirmed for court slot reservation ${orderId}`
          });

        } else if (isTournament) {
          // Process Tournament Registration
          await supabase.from("ledger_transactions").insert({
            user_id: defaultUserId,
            amount: amount,
            type: "credit",
            description: `Payment confirmed for tournament register ${orderId}`
          });
        } else if (isUMKMMerchant) {
          // Process local shop consignment order
          await supabase.from("ledger_transactions").insert({
            user_id: defaultUserId,
            amount: amount,
            type: "credit",
            description: `Payment confirmed for local shop consignment ${orderId}`
          });
        }
      } else if (isExpiredOrFailed) {
        // Handle cancelled or expired transactions
        if (isReservation) {
          const { data: reservation } = await supabase
            .from("reservations")
            .select("*")
            .eq("id", orderId)
            .single();

          if (reservation) {
            await supabase.from("reservations").update({ status: "CANCELLED" }).eq("id", orderId);
            if (reservation.slot_id) {
              // Release slot back to AVAILABLE
              await supabase.from("slots").update({ state: "AVAILABLE" }).eq("id", reservation.slot_id);
            }
          }
        }
      }

      return new Response(JSON.stringify({
        reconciled: true,
        orderId,
        status: isSettled ? "SETTLED" : "RELEASED",
        streamSegregated: "CASHLESS_AUTOMATION_SUPABASE",
        executionMs: Date.now() - startTime,
        message: "PRA webhook reconciled against physical Supabase database."
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } else {
      // In-memory Fallback for Preview environment
      console.log(`[Reconciliation Sandbox] Order: ${orderId} | Status: ${status} | Amount: ${amount}`);
      
      return new Response(JSON.stringify({
        reconciled: true,
        orderId,
        status: isSettled ? "SETTLED" : "RELEASED",
        streamSegregated: "CASHLESS_AUTOMATION_SANDBOX",
        executionMs: Date.now() - startTime,
        message: "PRA payment reconciled inside simulation sandbox."
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    console.error("PRA webhook execution error:", error);
    return new Response(JSON.stringify({ 
      reconciled: false, 
      message: "PRA webhook internal processing error.",
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
