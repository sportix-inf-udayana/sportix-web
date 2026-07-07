import { NextResponse } from "next/server";
import { withAuthAndCatch } from "../../../../lib/api-wrapper";

const MIDTRANS_URL = process.env.MIDTRANS_API_URL || "https://app.sandbox.midtrans.com/snap/v1/transactions";
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ? Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64") : null;

async function checkoutHandler(req, { supabase, user }) {
  const startTime = Date.now();
  const body = await req.json();
  const { items, deliveryAddress } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ success: false, message: "Keranjang belanja kosong." }, { status: 400 });
  }

  const safeAddress = deliveryAddress?.trim() || "Ambil di Pro-Shop Venue (Pick-Up)";
  let totalGrossAmount = 0;
  const verifiedItemsForMidtrans = [];
  const ordersToInsert = [];
  const executedDeductions = [];

  // Reusable Rollback Function
  const rollbackStocks = async () => {
    for (const item of executedDeductions) {
      const { data: rProd } = await supabase.from("umkm_products").select("stock").eq("id", item.id).single();
      if (rProd) await supabase.from("umkm_products").update({ stock: rProd.stock + item.qty }).eq("id", item.id);
    }
  };

  // 1. DATA PREPARATION & VERIFICATION
  for (const { productId, quantity } of items) {
    const qty = parseInt(quantity, 10);
    if (!productId || !qty || qty <= 0) {
      return NextResponse.json({ success: false, message: "Struktur item payload tidak valid." }, { status: 400 });
    }

    const { data: product, error: prodErr } = await supabase
      .from("umkm_products")
      .select("id, name, price, stock, store_id")
      .eq("id", productId)
      .single();

    if (prodErr || !product) {
      return NextResponse.json({ success: false, message: `Produk ID ${productId} tidak ditemukan.` }, { status: 404 });
    }

    if (product.stock < qty) {
      return NextResponse.json({ success: false, message: `Stok '${product.name}' tidak cukup. Sisa: ${product.stock}` }, { status: 409 });
    }

    const itemSubtotal = Number(product.price) * qty;
    totalGrossAmount += itemSubtotal;

    verifiedItemsForMidtrans.push({ id: product.id, price: Number(product.price), quantity: qty, name: product.name.substring(0, 50) });
    ordersToInsert.push({
      user_id: user.id,
      store_id: product.store_id,
      product_id: product.id,
      quantity: qty,
      delivery_address: safeAddress,
      status: "PENDING_PAYMENT",
      total_price: itemSubtotal
    });
  }

  // 2. ATOMIC INVENTORY LOCKING
  for (const orderItem of ordersToInsert) {
    const { data: currentProd, error: fetchErr } = await supabase.from("umkm_products").select("stock").eq("id", orderItem.product_id).single();

    if (fetchErr || currentProd.stock < orderItem.quantity) {
      await rollbackStocks();
      return NextResponse.json({ success: false, message: "Konkurensi stok gagal. Coba lagi." }, { status: 409 });
    }

    const { error: stockDeductErr } = await supabase.from("umkm_products").update({ stock: currentProd.stock - orderItem.quantity }).eq("id", orderItem.product_id);

    if (stockDeductErr) {
      await rollbackStocks();
      throw new Error("Gagal mengunci stok komoditas olahraga.");
    }
    
    executedDeductions.push({ id: orderItem.product_id, qty: orderItem.quantity });
  }

  // 3. INSERT ORDERS
  const { data: insertedOrders, error: orderInsertErr } = await supabase.from("umkm_orders").insert(ordersToInsert).select("id");
  
  if (orderInsertErr) {
    await rollbackStocks();
    throw orderInsertErr;
  }

  // 4. MIDTRANS PROCESSING
  if (!SERVER_KEY) return NextResponse.json({ success: false, message: "Kesalahan Konfigurasi Gateway." }, { status: 500 });

  const midtransOrderId = `UMKM-${insertedOrders[0].id}`;
  const midtransResponse = await fetch(MIDTRANS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Basic ${SERVER_KEY}`
    },
    body: JSON.stringify({
      transaction_details: { order_id: midtransOrderId, gross_amount: totalGrossAmount },
      item_details: verifiedItemsForMidtrans,
      customer_details: { email: user.email, first_name: user.user_metadata?.full_name || "Athlete Customer" },
      expiry: {
        start_time: new Date().toISOString().replace("T", " ").substring(0, 19) + " +0800",
        unit: "minutes",
        duration: 15
      }
    })
  });

  const midtransData = await midtransResponse.json();

  if (!midtransResponse.ok || !midtransData.token) {
    await rollbackStocks();
    return NextResponse.json({ success: false, message: "Payment Gateway menolak token." }, { status: 502 });
  }

  await supabase.from("umkm_orders").update({ payment_gateway_ref: midtransOrderId }).in("id", insertedOrders.map(o => o.id));

  return NextResponse.json({
    success: true,
    snapToken: midtransData.token,
    executionMs: Date.now() - startTime
  });
}

export const POST = withAuthAndCatch(checkoutHandler);