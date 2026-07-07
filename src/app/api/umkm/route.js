import { NextResponse } from "next/server";
import { withAuthAndCatch } from "../../../lib/api-wrapper";

async function getUmkmHandler(req, { supabase }) {
  const { data: products, error } = await supabase
    .from("umkm_products")
    .select("id, name, price, stock, umkm_stores(name)")
    .eq("status", "APPROVED");

  if (error) throw error;
  return NextResponse.json({ success: true, products });
}

export const GET = withAuthAndCatch(getUmkmHandler);