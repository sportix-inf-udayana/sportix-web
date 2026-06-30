import { NextResponse } from "next/server";
import { getSupabaseUser } from "../../../lib/supabase";

export async function POST(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    if (!token) return new NextResponse(JSON.stringify({ error: "Missing Token" }), { status: 401 });

    // FIX: Menggunakan token-bound client agar query tidak diblokir oleh RLS database
    const supabase = getSupabaseUser(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.user_metadata?.role !== 'UMKM_SELLER') {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        message: "Forbidden. Hanya akun Penjual UMKM yang tervalidasi yang dapat menambah produk." 
      }), { status: 403 });
    }

    const body = await req.json();
    const { name, description, price, stock } = body;

    if (!name || !price || stock === undefined) {
      return new NextResponse(JSON.stringify({ error: "Parameter nama, harga, dan stok wajib diisi." }), { status: 400 });
    }

    const { data: store, error: storeErr } = await supabase
      .from('umkm_stores')
      .select('id, status')
      .eq('owner_id', user.id)
      .single();

    if (storeErr || !store) {
      return new NextResponse(JSON.stringify({ error: "Toko tidak ditemukan. Pastikan Anda telah terdaftar." }), { status: 404 });
    }

    if (store.status !== 'APPROVED') {
      return new NextResponse(JSON.stringify({ error: "Operasi ditolak. Toko Anda belum disetujui oleh Super Admin." }), { status: 403 });
    }

    const { data: newProduct, error: insertErr } = await supabase
      .from('umkm_products')
      .insert({
        store_id: store.id,
        name: name.trim(),
        description: description?.trim() || "",
        price: Number(price),
        stock: Math.max(0, parseInt(stock, 10))
      })
      .select()
      .single();

    if (insertErr) {
      console.error("UMKM Product Insert Error:", insertErr);
      return new NextResponse(JSON.stringify({ error: "Gagal menyimpan produk ke katalog database." }), { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Produk berhasil ditambahkan ke etalase konsinyasi.",
      product: newProduct
    });

  } catch (error) {
    console.error("UMKM API Error:", error);
    return new NextResponse(JSON.stringify({ success: false, error: "Kesalahan server internal." }), { status: 500 });
  }
}