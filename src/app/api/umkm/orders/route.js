import { NextResponse } from "next/server";
import { getSupabaseUser } from "../../../lib/supabase";

export async function GET(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    if (!token) return NextResponse.json({ success: false, message: "Missing Token" }, { status: 401 });

    // FIX: Mengikat token ke database agar RLS bekerja memilah hak akses order secara otomatis
    const supabase = getSupabaseUser(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const role = user.user_metadata?.role || "CUSTOMER";

    let query = supabase.from("umkm_orders").select(`
      id, status, courier_name, delivery_address, total_price, created_at,
      umkm_products ( name, price )
    `);

    // Pembagian logika penarikan data secara aman berdasarkan role pengguna
    if (role === "UMKM_SELLER") {
      const { data: store } = await supabase.from("umkm_stores").select("id").eq("owner_id", user.id).single();
      if (store) {
        query = query.eq("store_id", store.id);
      } else {
        return NextResponse.json({ success: true, orders: [] });
      }
    } else {
      // Pembeli biasa hanya diizinkan melihat riwayat transaksinya sendiri
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