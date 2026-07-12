// src/app/api/umkm/checkout/route.js
import { NextResponse } from "next/server";
import { withAuthAndCatch, AppError } from "@api-wrapper";
import { UmkmService } from "@umkm.service";

async function checkoutHandler(req, { supabase, user }) {
  const startTime = Date.now();
  const body = await req.json();
  const { items, deliveryAddress } = body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Keranjang belanja kosong.", 400);
  }

  // Pindahkan seluruh logika berat ke Service Layer untuk isolasi
  const result = await UmkmService.processCheckout({
    supabase,
    user,
    items,
    deliveryAddress: deliveryAddress?.trim() || "Ambil di Pro-Shop Venue (Pick-Up)"
  });

  return NextResponse.json({
    success: true,
    snapToken: result.snapToken,
    executionMs: Date.now() - startTime
  });
}

export const POST = withAuthAndCatch(checkoutHandler);