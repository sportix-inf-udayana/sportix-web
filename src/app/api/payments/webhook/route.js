import { getSupabaseAdmin } from "../../../../lib/supabase";
import crypto from "crypto";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    
    // Verifikasi Tanda Tangan Kriptografi Lapis Dasar (Zero-Trust Validation)
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("CRITICAL HALT: MIDTRANS_SERVER_KEY tidak ditemukan di environment.");
      return new Response("Kesalahan konfigurasi server internal.", { status: 500 });
    }

    const { 
      order_id, 
      status_code, 
      gross_amount, 
      signature_key, 
      transaction_status 
    } = body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return new Response(JSON.stringify({ reconciled: false, message: "Payload tidak lengkap." }), { status: 400 });
    }

    const hashString = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expectedSignature = crypto.createHash("sha512").update(hashString).digest("hex");

    if (expectedSignature !== signature_key) {
      console.warn(`[RED TEAM ALERT]: Signature spoofing terdeteksi pada order ${order_id}`);
      return new Response(JSON.stringify({ reconciled: false, message: "Unauthorized. Signature ditolak." }), { status: 401 });
    }

    const firstDashIndex = order_id.indexOf('-');
    if (firstDashIndex === -1) {
      return new Response(JSON.stringify({ reconciled: false, message: "Format Order ID tidak valid (Prefix hilang)." }), { status: 400 });
    }

    const prefix = order_id.substring(0, firstDashIndex); 
    const actualUuid = order_id.substring(firstDashIndex + 1); 

    const supabase = getSupabaseAdmin();
    if (!supabase) return new Response("Layanan Database Tidak Tersedia", { status: 503 });

    const isSettled = ["settlement", "capture"].includes(transaction_status.toLowerCase());
    const isExpiredOrFailed = ["expire", "cancel", "deny"].includes(transaction_status.toLowerCase());

    if (isSettled) {
      // 1. PROSES EKOSISTEM RESERVASI LAPANGAN (REV)
      if (prefix === "REV") {
        const { data: reservation, error: fetchErr } = await supabase
          .from("reservations")
          .select("id, status, user_id, field_id")
          .eq("id", actualUuid)
          .single();

        if (fetchErr || !reservation) {
          await supabase.from("refund_logs").insert({
            reservation_id: null,
            payment_gateway_ref: order_id,
            amount_paid: Number(gross_amount),
            status: "PENDING_ACTION",
            notes: "Webhook sukses namun UUID reservasi fisik tidak ditemukan di database."
          });
          return new Response(JSON.stringify({ status: "ROUTED_TO_REFUND" }), { status: 200 });
        }

        if (reservation.status === 'CONFIRMED' || reservation.status === 'COMPLETED') {
           return new Response(JSON.stringify({ status: "ALREADY_SETTLED" }), { status: 200 });
        }

        if (reservation.status === 'EXPIRED' || reservation.status === 'EXPIRED_PAID') {
          await supabase.from("reservations").update({ status: "EXPIRED_PAID" }).eq("id", actualUuid);
          await supabase.from("refund_logs").insert({
            reservation_id: actualUuid,
            payment_gateway_ref: order_id,
            amount_paid: Number(gross_amount),
            status: "PENDING_ACTION",
            notes: "Late payment. Pembayaran diterima setelah masa locked 15 menit habis."
          });
          return new Response(JSON.stringify({ status: "LATE_PAYMENT_REFUNDED" }), { status: 200 });
        }

        // Eksekusi Sukses - FIX: Koreksi pembaruan status slot menggunakan reservation_id relasional riil
        await supabase.from("reservations").update({ status: "CONFIRMED" }).eq("id", actualUuid);
        await supabase.from("slots").update({ status: "BOOKED" }).eq("reservation_id", actualUuid);

        // Catat ke Buku Besar Transaksi (Ledger CREDIT)
        await supabase.from("ledger_transactions").insert({
          user_id: reservation.user_id,
          transaction_type: "CREDIT",
          source: "COURT_BOOKING",
          amount: Number(gross_amount),
          reservation_id: actualUuid
        });
      }

      // 2. PROSES EKOSISTEM TURNAMEN LOKAL (TRN)
      else if (prefix === "TRN") {
        const { data: registration } = await supabase
          .from("tournament_registrations")
          .select("id, status, user_id, tournament_id")
          .eq("id", actualUuid)
          .single();

        if (registration && registration.payment_status !== 'PAID') {
          await supabase.from("tournament_registrations").update({ 
            status: "CONFIRMED",
            payment_status: "PAID"
          }).eq("id", actualUuid);

          await supabase.from("ledger_transactions").insert({
            user_id: registration.user_id,
            transaction_type: "CREDIT",
            source: "TOURNAMENT_REVENUE",
            amount: Number(gross_amount),
            tournament_registration_id: actualUuid
          });
        }
      }

      // 3. PROSES EKOSISTEM LOKAPASAR KONSINYASI UMKM (UMKM)
      else if (prefix === "UMKM") {
        const { data: order } = await supabase
          .from("umkm_orders")
          .select("id, status, user_id, total_price, store_id")
          .eq("id", actualUuid)
          .single();

        if (order && order.status === "PENDING_PAYMENT") {
          await supabase.from("umkm_orders").update({ status: "PREPARING" }).eq("id", actualUuid);

          const { data: storeInfo } = await supabase.from("umkm_stores").select("owner_id").eq("id", order.store_id).single();
          if (storeInfo) {
            await supabase.from("ledger_transactions").insert({
              user_id: storeInfo.owner_id,
              transaction_type: "CREDIT",
              source: "UMKM_PRODUCT_SALE",
              amount: order.total_price,
              umkm_order_id: order.id
            });
          }
        }
      }

    } else if (isExpiredOrFailed) {
      if (prefix === "REV") {
        const { data: reservation } = await supabase.from("reservations").select("status, field_id").eq("id", actualUuid).single();
        if (reservation && reservation.status === 'PENDING') {
          await supabase.from("reservations").update({ status: "EXPIRED" }).eq("id", actualUuid); 
          await supabase.from("slots").update({ status: "AVAILABLE", locked_until: null, reservation_id: null }).eq("reservation_id", actualUuid);
        }
      } 
      else if (prefix === "TRN") {
         const { data: registration } = await supabase.from("tournament_registrations").select("status").eq("id", actualUuid).single();
         if (registration && registration.payment_status === 'PENDING') {
           await supabase.from("tournament_registrations").update({ status: "CANCELLED" }).eq("id", actualUuid);
         }
      } 
      else if (prefix === "UMKM") {
         const { data: order } = await supabase.from("umkm_orders").select("status, product_id, quantity").eq("id", actualUuid).single();
         if (order && order.status === "PENDING_PAYMENT") {
           await supabase.from("umkm_orders").update({ status: "CANCELLED" }).eq("id", actualUuid);
           if (order.product_id && order.quantity) {
             const { data: currentProd } = await supabase.from("umkm_products").select("stock").eq("id", order.product_id).single();
             if (currentProd) {
               await supabase.from("umkm_products").update({ stock: currentProd.stock + order.quantity }).eq("id", order.product_id);
             }
           }
         }
      }
    }

    return new Response(JSON.stringify({
      reconciled: true,
      status: isSettled ? "SETTLED_WITH_LEDGER" : "RELEASED_OR_CANCELLED",
      executionMs: Date.now() - startTime
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Webhook Internal Panic:", error);
    return new Response(JSON.stringify({ reconciled: false, error: "Internal Server Error" }), { status: 500 });
  }
}