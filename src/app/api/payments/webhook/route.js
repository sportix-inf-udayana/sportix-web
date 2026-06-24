import { getSupabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    
    // Validasi Signature Kriptografi Midtrans Mutlak
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("CRITICAL: MIDTRANS_SERVER_KEY is missing in environment.");
      return new Response("Server configuration error", { status: 500 });
    }

    const { 
      order_id, 
      status_code, 
      gross_amount, 
      signature_key, 
      transaction_status 
    } = body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return new Response(JSON.stringify({ reconciled: false, message: "Invalid payload format." }), { status: 400 });
    }

    // Kalkulasi hash SHA512 sesuai standar keamanan Midtrans
    const hashString = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expectedSignature = crypto.createHash("sha512").update(hashString).digest("hex");

    if (expectedSignature !== signature_key) {
      console.warn(`SECURITY ALERT: Invalid webhook signature detected for order ${order_id}`);
      return new Response(JSON.stringify({ reconciled: false, message: "Unauthorized. Invalid Signature." }), { status: 401 });
    }

    const supabase = getSupabase();
    if (!supabase) return new Response("Service Unavailable", { status: 503 });

    const isReservation = order_id.startsWith("REV-");
    const isSettled = ["settlement", "capture"].includes(transaction_status.toLowerCase());
    const isExpiredOrFailed = ["expire", "cancel", "deny"].includes(transaction_status.toLowerCase());

    if (isSettled) {
      if (isReservation) {
        const { data: reservation } = await supabase.from("reservations").select("*").eq("id", order_id).single();

        if (!reservation) {
          await supabase.from("refund_logs").insert({
            reservation_id: order_id,
            payment_gateway_ref: order_id,
            amount_paid: Number(gross_amount),
            status: "PENDING_ACTION",
            notes: "Reservation record missing on valid webhook"
          });
          return new Response(JSON.stringify({ status: "ROUTED_TO_REFUND" }), { status: 200 });
        }

        await supabase.from("reservations").update({ status: "CONFIRMED" }).eq("id", order_id);
        
        if (reservation.field_id) {
          await supabase.from("slots").update({ status: "BOOKED" }).eq("id", reservation.field_id);
        }

        await supabase.from("ledger_transactions").insert({
          user_id: reservation.user_id,
          transaction_type: "CREDIT",
          source: "COURT_BOOKING",
          amount: Number(gross_amount),
          reservation_id: order_id
        });
      }
      // ... (Tambahkan logika Turnamen/UMKM di sini dengan UUID asli yang terekstrak dari token turnamen)

    } else if (isExpiredOrFailed) {
      if (isReservation) {
        const { data: reservation } = await supabase.from("reservations").select("*").eq("id", order_id).single();
        if (reservation) {
          await supabase.from("reservations").update({ status: "EXPIRED" }).eq("id", order_id); 
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