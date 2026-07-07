import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuthAndCatch } from "../../../lib/api-wrapper";
import { ROLE } from "../../../lib/constants";

async function getOrdersHandler(req, { supabase, user }) {
  const role = user.user_metadata?.role || ROLE.CUSTOMER;

  let query = supabase.from("umkm_orders").select(`
    id, status, courier_name, delivery_address, total_price, created_at,
    umkm_products ( name, price )
  `);

  if (role === ROLE.UMKM_SELLER) {
    const { data: store } = await supabase.from("umkm_stores").select("id").eq("owner_id", user.id).single();
    if (!store) return NextResponse.json({ success: true, orders: [] });
    query = query.eq("store_id", store.id);
  } else {
    query = query.eq("user_id", user.id);
  }

  const { data: orders, error: fetchErr } = await query.order("created_at", { ascending: false });
  if (fetchErr) throw fetchErr;

  return NextResponse.json({ success: true, orders: orders || [] });
}

const patchOrderSchema = z.object({
  orderId: z.string().uuid("ID Order tidak valid"),
  targetStatus: z.string().min(3),
  courierName: z.string().optional()
});

async function patchOrderHandler(req, { supabase, user }) {
  const body = await req.json();
  const { orderId, targetStatus, courierName } = patchOrderSchema.parse(body);

  const { data: store } = await supabase.from("umkm_stores").select("id").eq("owner_id", user.id).single();
  if (!store) {
    return NextResponse.json({ success: false, message: "Profil toko tidak valid." }, { status: 403 });
  }

  const { data: updatedOrder, error: updateErr } = await supabase
    .from("umkm_orders")
    .update({
      status: targetStatus,
      courier_name: courierName?.trim() || "Kurir Pengantar Lokal"
    })
    .eq("id", orderId)
    .eq("store_id", store.id) // Anti-IDOR (Isolasi Tenant)
    .select();

  if (updateErr || !updatedOrder || updatedOrder.length === 0) {
    return NextResponse.json({ success: false, message: "Gagal memproses perubahan logistik." }, { status: 409 });
  }

  return NextResponse.json({ success: true, message: "Manifes status logistik diperbarui." });
}

export const GET = withAuthAndCatch(getOrdersHandler);
export const PATCH = withAuthAndCatch(patchOrderHandler);