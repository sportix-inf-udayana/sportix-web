import { NextResponse } from "next/server";
import { withAuthAndCatch } from "../../../lib/api-wrapper";

async function getUmkmCatalogHandler(req, { supabase }) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('storeId');

  let query = supabase.from("umkm_products").select("id, name, price, stock, description, image_url, store_id");

  // Jika spesifik difilter berdasarkan lapak
  if (storeId) {
    query = query.eq("store_id", storeId);
  }

  // Hanya kembalikan inventaris dengan stok tersedia dan status lapak aktif
  const { data: products, error } = await query
    .eq("status", "ACTIVE")
    .gt("stock", 0)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return NextResponse.json({ success: true, data: products || [] });
}

// Katalog produk harus bisa diakses publik (tanpa token juga aman, karena ini data Read-Only)
// Namun kita tetap bungkus untuk error handling
export const GET = withAuthAndCatch(getUmkmCatalogHandler);