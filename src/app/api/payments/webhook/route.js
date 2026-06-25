import { getSupabase } from "../../../../lib/supabase";
import crypto from "crypto";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    
    // 1. Validasi Signature Kriptografi Lapis Dasar (Zero-Trust)
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

    // Hash SHA512 murni untuk menolak injeksi cURL palsu dari penyerang
    const hashString = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expectedSignature = crypto.createHash("sha512").update(hashString).digest("hex");

    if (expectedSignature !== signature_key) {
      console.warn(`[RED TEAM ALERT]: Signature spoofing terdeteksi pada order ${order_id}`);
      return new Response(JSON.stringify({ reconciled: false, message: "Unauthorized. Signature ditolak." }), { status: 401 });
    }

    // 2. Destrukturisasi Tipe Data (Menyelamatkan Crash PostgreSQL UUID)
    // Format yang diharapkan: "PREFIX-uuid_asli" (e.g., "REV-123e4567-...")
    const firstDashIndex = order_id.indexOf('-');
    if (firstDashIndex === -1) {
      return new Response(JSON.stringify({ reconciled: false, message: "Format Order ID tidak valid (Prefix hilang)." }), { status: 400 });
    }

    const prefix = order_id.substring(0, firstDashIndex); // "REV", "TRN", atau "UMKM"
    const actualUuid = order_id.substring(firstDashIndex + 1); // "123e4567-e89b-..."

    const supabase = getSupabase();
    if (!supabase) return new Response("Layanan Database Tidak Tersedia", { status: 503 });

    const isSettled = ["settlement", "capture"].includes(transaction_status.toLowerCase());
    const isExpiredOrFailed = ["expire", "cancel", "deny"].includes(transaction_status.toLowerCase());

    // 3. Routing Berdasarkan Ekosistem (Reservasi, Turnamen, UMKM)
    if (isSettled) {
      
      // --- A. EKOSISTEM RESERVASI LAPANGAN (REV) ---
      if (prefix === "REV") {
        const { data: reservation, error: fetchErr } = await supabase
          .from("reservations")
          .select("id, status, user_id, field_id")
          .eq("id", actualUuid)
          .single();

        if (fetchErr || !reservation) {
          // Tangani anomali di mana user membayar tapi baris sudah terhapus
          await supabase.from("refund_logs").insert({
            reservation_id: null,
            payment_gateway_ref: order_id,
            amount_paid: Number(gross_amount),
            status: "PENDING_ACTION",
            notes: "Webhook sukses namun UUID reservasi fisik tidak ditemukan di database."
          });
          return new Response(JSON.stringify({ status: "ROUTED_TO_REFUND" }), { status: 200 });
        }

        // Cegah eksekusi ganda jika Webhook dikirim berkali-kali oleh Midtrans
        if (reservation.status === 'CONFIRMED' || reservation.status === 'COMPLETED') {
           return new Response(JSON.stringify({ status: "ALREADY_SETTLED" }), { status: 200 });
        }

        // Jika pembayaran sukses, tapi SLA telah keburu mengubah status menjadi EXPIRED
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

        // Eksekusi Sukses Normal
        await supabase.from("reservations").update({ status: "CONFIRMED" }).eq("id", actualUuid);
        if (reservation.field_id) {
          await supabase.from("slots").update({ status: "BOOKED" }).eq("id", reservation.field_id);
        }

        // Tulis ke Ledger (Double-Entry)
        await supabase.from("ledger_transactions").insert({
          user_id: reservation.user_id,
          transaction_type: "CREDIT",
          source: "COURT_BOOKING",
          amount: Number(gross_amount),
          reservation_id: actualUuid
        });
      }

      // --- B. EKOSISTEM TURNAMEN LOKAL (TRN) ---
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

          // Tulis ke Ledger Turnamen
          await supabase.from("ledger_transactions").insert({
            user_id: registration.user_id,
            transaction_type: "CREDIT",
            source: "TOURNAMENT_REVENUE",
            amount: Number(gross_amount),
            tournament_registration_id: actualUuid
          });
        }
      }

      // --- C. EKOSISTEM LOKAPASAR KONSINYASI UMKM (UMKM) ---
      else if (prefix === "UMKM") {
        const { data: order } = await supabase
          .from("umkm_orders")
          .select("id, status, user_id, total_price, store_id")
          .eq("id", actualUuid)
          .single();

        if (order && order.status === "PENDING_PAYMENT") {
          // 1. Naikkan status menjadi PREPARING
          await supabase
            .from("umkm_orders")
            .update({ status: "PREPARING" })
            .eq("id", actualUuid);

          // 2. Alirkan dana bersih ke Buku Besar (Ledger CREDIT) milik Toko UMKM Merchant
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
      // 4. Logika Pembersihan & Rollback (Kegagalan Pembayaran)
      
      if (prefix === "REV") {
        const { data: reservation } = await supabase.from("reservations").select("status, field_id").eq("id", actualUuid).single();
        if (reservation && reservation.status === 'PENDING') {
          await supabase.from("reservations").update({ status: "EXPIRED" }).eq("id", actualUuid); 
          if (reservation.field_id) {
            await supabase.from("slots").update({ status: "AVAILABLE", locked_until: null }).eq("id", reservation.field_id);
          }
        }
      } 
      
      else if (prefix === "TRN") {
         const { data: registration } = await supabase.from("tournament_registrations").select("status").eq("id", actualUuid).single();
         if (registration && registration.payment_status === 'PENDING') {
           await supabase.from("tournament_registrations").update({ status: "CANCELLED" }).eq("id", actualUuid);
         }
      } 
      
      else if (prefix === "UMKM") {
         const { data: order } = await supabase
           .from("umkm_orders")
           .select("status, product_id, quantity")
           .eq("id", actualUuid)
           .single();
           
         if (order && order.status === "PENDING_PAYMENT") {
           // 1. Batalkan Pesanan
           await supabase.from("umkm_orders").update({ status: "CANCELLED" }).eq("id", actualUuid);
           
           // 2. Kembalikan (Rollback) Stok Barang Fisik ke Toko
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
    console.error("PRA Webhook Panic:", error);
    return new Response(JSON.stringify({ reconciled: false, error: "Internal Server Error during Reconciliation" }), { status: 500 });
  }
}