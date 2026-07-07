import { getSupabaseAdmin } from "../../../../lib/supabase";
import crypto from "crypto";
import { z } from "zod";

const webhookSchema = z.object({
  order_id: z.string(),
  status_code: z.string(),
  gross_amount: z.string(),
  signature_key: z.string(),
  transaction_status: z.string()
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { order_id, status_code, gross_amount, signature_key, transaction_status } = webhookSchema.parse(body);

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) return new Response("Konfigurasi server invalid", { status: 500 });

    const hashString = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expectedSignature = crypto.createHash("sha512").update(hashString).digest("hex");

    if (expectedSignature !== signature_key) {
      return new Response(JSON.stringify({ reconciled: false, message: "Invalid Signature" }), { status: 401 });
    }

    const firstDashIndex = order_id.indexOf('-');
    if (firstDashIndex === -1) return new Response("Format Order invalid", { status: 400 });

    const prefix = order_id.substring(0, firstDashIndex); 
    let actualUuid = order_id.substring(firstDashIndex + 1); 

    if (prefix === "REV") {
      const secondDashIndex = actualUuid.indexOf('-');
      if (secondDashIndex !== -1) actualUuid = actualUuid.substring(0, 36);
    }

    const supabase = getSupabaseAdmin();
    const isSettled = ["settlement", "capture"].includes(transaction_status.toLowerCase());
    const isExpiredOrFailed = ["expire", "cancel", "deny"].includes(transaction_status.toLowerCase());

    if (isSettled) {
      if (prefix === "REV") {
        const { data: existing } = await supabase.from("ledger_transactions").select("id").eq("reservation_id", actualUuid).maybeSingle();
        if (existing) return new Response(JSON.stringify({ status: "PROCESSED" }), { status: 200 });

        const { data: res } = await supabase.from("reservations").select("id, status, user_id").eq("id", actualUuid).single();
        
        if (!res) {
          await supabase.from("refund_logs").insert({ payment_gateway_ref: order_id, amount_paid: Number(gross_amount), status: "PENDING_ACTION" });
          return new Response(JSON.stringify({ status: "ROUTED_TO_REFUND" }), { status: 200 });
        }

        if (res.status === 'EXPIRED') {
          await supabase.from("reservations").update({ status: "EXPIRED_PAID" }).eq("id", actualUuid);
          await supabase.from("refund_logs").insert({ reservation_id: actualUuid, payment_gateway_ref: order_id, amount_paid: Number(gross_amount), status: "PENDING_ACTION" });
          return new Response(JSON.stringify({ status: "LATE_PAYMENT_REFUNDED" }), { status: 200 });
        }

        await supabase.from("reservations").update({ status: "CONFIRMED" }).eq("id", actualUuid);
        await supabase.from("slots").update({ status: "BOOKED" }).eq("reservation_id", actualUuid);
        await supabase.from("ledger_transactions").insert({ user_id: res.user_id, transaction_type: "CREDIT", source: "COURT_BOOKING", amount: Number(gross_amount), reservation_id: actualUuid });
      }
      else if (prefix === "TRN") {
        const { data: existing } = await supabase.from("ledger_transactions").select("id").eq("tournament_registration_id", actualUuid).maybeSingle();
        if (existing) return new Response(JSON.stringify({ status: "PROCESSED" }), { status: 200 });

        const { data: reg } = await supabase.from("tournament_registrations").select("id, user_id, payment_status").eq("id", actualUuid).single();
        if (reg && reg.payment_status !== 'PAID') {
          await supabase.from("tournament_registrations").update({ status: "CONFIRMED", payment_status: "PAID" }).eq("id", actualUuid);
          await supabase.from("ledger_transactions").insert({ user_id: reg.user_id, transaction_type: "CREDIT", source: "TOURNAMENT_REVENUE", amount: Number(gross_amount), tournament_registration_id: actualUuid });
        }
      }
      else if (prefix === "UMKM") {
        const { data: existing } = await supabase.from("ledger_transactions").select("id").eq("umkm_order_id", actualUuid).maybeSingle();
        if (existing) return new Response(JSON.stringify({ status: "PROCESSED" }), { status: 200 });

        const { data: order } = await supabase.from("umkm_orders").select("id, total_price, store_id, status").eq("id", actualUuid).single();
        if (order && order.status === "PENDING_PAYMENT") {
          await supabase.from("umkm_orders").update({ status: "PREPARING" }).eq("id", actualUuid);
          const { data: storeInfo } = await supabase.from("umkm_stores").select("owner_id").eq("id", order.store_id).single();
          if (storeInfo) {
            await supabase.from("ledger_transactions").insert({ user_id: storeInfo.owner_id, transaction_type: "CREDIT", source: "UMKM_PRODUCT_SALE", amount: order.total_price, umkm_order_id: order.id });
          }
        }
      }
    } else if (isExpiredOrFailed) {
      if (prefix === "REV") {
        const { data: res } = await supabase.from("reservations").select("status").eq("id", actualUuid).single();
        if (res && res.status === 'PENDING') {
          await supabase.from("reservations").update({ status: "EXPIRED" }).eq("id", actualUuid); 
          await supabase.from("slots").update({ status: "AVAILABLE", locked_until: null, reservation_id: null }).eq("reservation_id", actualUuid);
        }
      } 
      else if (prefix === "TRN") {
         await supabase.from("tournament_registrations").update({ status: "CANCELLED" }).eq("id", actualUuid);
      } 
      else if (prefix === "UMKM") {
         const { data: order } = await supabase.from("umkm_orders").select("status, product_id, quantity").eq("id", actualUuid).single();
         if (order && order.status === "PENDING_PAYMENT") {
           await supabase.from("umkm_orders").update({ status: "CANCELLED" }).eq("id", actualUuid);
           const { data: prod } = await supabase.from("umkm_products").select("stock").eq("id", order.product_id).single();
           if (prod) await supabase.from("umkm_products").update({ stock: prod.stock + order.quantity }).eq("id", order.product_id);
         }
      }
    }

    return new Response(JSON.stringify({ reconciled: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook Panic:", error);
    return new Response("Invalid Payload", { status: 400 });
  }
}