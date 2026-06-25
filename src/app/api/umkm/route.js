import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";

export async function POST(req) {
  try {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Database offline.");

    // 1. Otorisasi Mutlak: Penegakan Hak Akses UMKM Seller
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

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

    // 2. Cegah Injeksi Lintas Toko (Cross-Store Injection)
    // Jangan pernah percaya store_id dari payload frontend. Tarik id toko berdasarkan user.id.
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

    // 3. Eksekusi Penambahan Katalog dengan Constraint Fisik Database
    const { data: newProduct, error: insertErr } = await supabase
      .from('umkm_products')
      .insert({
        store_id: store.id,
        name: name.trim(),
        description: description?.trim() || "",
        price: Number(price),
        stock: Math.max(0, parseInt(stock, 10)) // Cegah stok negatif
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