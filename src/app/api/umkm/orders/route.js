import { NextResponse } from "next/server";
import { getSupabaseUser } from "../../../lib/supabase";

export async function GET(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    if (!token) return NextResponse.json({ success: false, message: "Missing Token" }, { status: 401 });

    const supabase = getSupabaseUser(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const role = user.user_metadata?.role || "CUSTOMER";

    let query = supabase.from("umkm_orders").select(`
      id, status, courier_name, delivery_address, total_price, created_at,
      umkm_products ( name, price )
    `);

    if (role === "UMKM_SELLER") {
      const { data: store } = await supabase.from("umkm_stores").select("id").eq("owner_id", user.id).single();
      if (store) {
        query = query.eq("store_id", store.id);
      } else {
        return NextResponse.json({ success: true, orders: [] });
      }
    } else {
      query = query.eq("user_id", user.id);
    }

    const { data: orders, error: fetchErr } = await query.order("created_at", { ascending: false });
    if (fetchErr) throw fetchErr;

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (error) {
    console.error("UMKM Orders API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// FIX UTUH: Tambahkan handler PATCH untuk menyambungkan alur ShipmentDispatcherClient milik penjual
export async function PATCH(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    if (!token) return NextResponse.json({ success: false, message: "Missing Token" }, { status: 401 });

    const supabase = getSupabaseUser(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { orderId, targetStatus, courierName } = body;

    if (!orderId || !targetStatus) {
      return NextResponse.json({ success: false, message: "Parameter update tidak lengkap." }, { status: 400 });
    }

    // Pastikan penjual hanya bisa mengubah status order dari toko miliknya sendiri (Anti IDOR)
    const { data: store } = await supabase.from("umkm_stores").select("id").eq("owner_id", user.id).single();
    if (!store) {
      return NextResponse.json({ success: false, message: "Akses Ditolak. Profil toko jualan Anda tidak valid." }, { status: 403 });
    }

    const { data: updatedOrder, error: updateErr } = await supabase
      .from("umkm_orders")
      .update({
        status: targetStatus,
        courier_name: courierName?.trim() || "Kurir Pengantar Lokal"
      })
      .eq("id", orderId)
      .eq("store_id", store.id) // Kunci isolasi multi-tenant jualan
      .select();

    if (updateErr || !updatedOrder || updatedOrder.length === 0) {
      return NextResponse.json({ success: false, message: "Gagal memproses perubahan logistik barang atau order ilegal." }, { status: 409 });
    }

    return NextResponse.json({ success: true, message: "Manifes status logistik kiriman berhasil diperbarui." });

  } catch (error) {
    console.error("UMKM Orders Patch Panic:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}