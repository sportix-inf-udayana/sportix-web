import { NextResponse } from "next/server";
import { getSupabase } from "../../../../lib/supabase";

export async function PATCH(req) {
  try {
    const supabase = getSupabase();
    if (!supabase) return new NextResponse("Service Unavailable", { status: 503 });

    // 1. Verifikasi JWT Penjual
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user || user.user_metadata?.role !== 'UMKM_SELLER') {
      return NextResponse.json({ success: false, message: "Akses Ditolak. Khusus Penjual UMKM." }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, courierName, status } = body;

    if (!orderId || !courierName || !status) {
      return NextResponse.json({ success: false, message: "Payload pengiriman tidak valid." }, { status: 400 });
    }

    // 2. Validasi Kepemilikan Toko (Mencegah Admin Toko A meng-update pesanan Toko B)
    const { data: storeCheck } = await supabase
      .from('umkm_stores')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!storeCheck) {
       return NextResponse.json({ success: false, message: "Toko tidak terdaftar." }, { status: 404 });
    }

    // 3. Eksekusi Update ke Database
    const { error: updateErr } = await supabase
      .from('umkm_orders')
      .update({ 
        courier_name: courierName.trim(),
        status: status 
      })
      .eq('id', orderId)
      .eq('store_id', storeCheck.id); // Guard rail mutlak

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: `Status pesanan ${orderId} berhasil diperbarui menjadi ${status}.`
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: "Kesalahan server internal." }, { status: 500 });
  }
}