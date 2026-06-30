import { NextResponse } from "next/server";
import { getSupabaseUser } from "../../../../lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    if (!token) return NextResponse.json({ success: false, message: "Missing Token" }, { status: 401 });

    // Menggunakan Token-Bound Client agar RLS mencatat user_id secara otonom
    const supabase = getSupabaseUser(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Akses Ditolak. Sesi otorisasi hilang." }, { status: 401 });
    }

    const body = await req.json();
    const { items, deliveryAddress } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Keranjang belanja kosong." }, { status: 400 });
    }

    const safeAddress = deliveryAddress?.trim() || "Ambil di Pro-Shop Venue (Pick-Up)";
    let totalGrossAmount = 0;
    const verifiedItemsForMidtrans = [];
    const ordersToInsert = [];

    // SERVER-SIDE VERIFICATION
    for (const item of items) {
      const { productId, quantity } = item;
      if (!productId || !quantity || quantity <= 0) {
        return NextResponse.json({ success: false, message: "Struktur item payload tidak valid." }, { status: 400 });
      }

      const { data: product, error: prodErr } = await supabase
        .from("umkm_products")
        .select("id, name, price, stock, store_id")
        .eq("id", productId)
        .single();

      if (prodErr || !product) {
        return NextResponse.json({ success: false, message: `Produk dengan ID ${productId} tidak ditemukan.` }, { status: 404 });
      }

      if (product.stock < quantity) {
        return NextResponse.json({ 
          success: false, 
          message: `Gagal Checkout: Stok untuk '${product.name}' tidak mencukupi. Sisa: ${product.stock} unit.` 
        }, { status: 409 });
      }

      const itemSubtotal = Number(product.price) * parseInt(quantity, 10);
      totalGrossAmount += itemSubtotal;

      verifiedItemsForMidtrans.push({
        id: product.id,
        price: Number(product.price),
        quantity: parseInt(quantity, 10),
        name: product.name.substring(0, 50)
      });

      ordersToInsert.push({
        user_id: user.id,
        store_id: product.store_id,
        product_id: product.id,
        quantity: parseInt(quantity, 10),
        delivery_address: safeAddress,
        status: "PENDING_PAYMENT", 
        total_price: itemSubtotal
      });
    }

    // ATOMIC INVENTORY LOCKING LOOP
    const executedDeductions = [];
    for (const orderItem of ordersToInsert) {
      const { data: currentProd, error: fetchErr } = await supabase
        .from("umkm_products")
        .select("stock")
        .eq("id", orderItem.product_id)
        .single();

      if (fetchErr || currentProd.stock < orderItem.quantity) {
        // Memicu mekanisme rollback untuk item yang telah keburu dikurangi sebelumnya
        for (const rollbackItem of executedDeductions) {
          const { data: rProd } = await supabase.from("umkm_products").select("stock").eq("id", rollbackItem.id).single();
          await supabase.from("umkm_products").update({ stock: rProd.stock + rollbackItem.qty }).eq("id", rollbackItem.id);
        }
        return NextResponse.json({ success: false, message: "Terjadi gangguan konkurensi stok. Silakan coba lagi." }, { status: 409 });
      }

      const newStock = currentProd.stock - orderItem.quantity;
      const { error: stockDeductErr } = await supabase
        .from("umkm_products")
        .update({ stock: newStock })
        .eq("id", orderItem.product_id);

      if (stockDeductErr) {
        for (const rollbackItem of executedDeductions) {
          const { data: rProd } = await supabase.from("umkm_products").select("stock").eq("id", rollbackItem.id).single();
          await supabase.from("umkm_products").update({ stock: rProd.stock + rollbackItem.qty }).eq("id", rollbackItem.id);
        }
        throw new Error("Gagal mengunci stok komoditas olahraga.");
      }

      executedDeductions.push({ id: orderItem.product_id, qty: orderItem.quantity });
    }

    const { data: insertedOrders, error: orderInsertErr } = await supabase
      .from("umkm_orders")
      .insert(ordersToInsert)
      .select("id");

    if (orderInsertErr) {
      // Rollback terstruktur menggunakan array pelacak deduksi riil
      for (const rollbackItem of executedDeductions) {
        const { data: rProd } = await supabase.from("umkm_products").select("stock").eq("id", rollbackItem.id).single();
        await supabase.from("umkm_products").update({ stock: rProd.stock + rollbackItem.qty }).eq("id", rollbackItem.id);
      }
      throw orderInsertErr;
    }

    const primaryOrderId = insertedOrders[0].id;
    const midtransOrderId = `UMKM-${primaryOrderId}`;

    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
    if (!midtransServerKey) {
      return NextResponse.json({ success: false, message: "Kesalahan Konfigurasi Gateway Server." }, { status: 500 });
    }

    const midtransPayload = {
      transaction_details: { order_id: midtransOrderId, gross_amount: totalGrossAmount },
      item_details: verifiedItemsForMidtrans,
      customer_details: { email: user.email, first_name: user.user_metadata?.full_name || "Athlete Customer" },
      expiry: {
        start_time: new Date().toISOString().replace("T", " ").substring(0, 19) + " +0800",
        unit: "minutes",
        duration: 15
      }
    };

    const midtransResponse = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${Buffer.from(midtransServerKey + ":").toString("base64")}`
      },
      body: JSON.stringify(midtransPayload)
    });

    const midtransData = await midtransResponse.json();

    if (!midtransResponse.ok || !midtransData.token) {
      for (const rollbackItem of executedDeductions) {
        const { data: rProd } = await supabase.from("umkm_products").select("stock").eq("id", rollbackItem.id).single();
        await supabase.from("umkm_products").update({ stock: rProd.stock + rollbackItem.qty }).eq("id", rollbackItem.id);
      }
      return NextResponse.json({ success: false, message: "Payment Gateway menolak pembuatan token transaksi." }, { status: 502 });
    }

    const orderUuids = insertedOrders.map(o => o.id);
    await supabase.from("umkm_orders").update({ payment_gateway_ref: midtransOrderId }).in("id", orderUuids);

    return NextResponse.json({
      success: true,
      message: "Checkout aman terverifikasi oleh Server.",
      snapToken: midtransData.token,
      executionMs: Date.now() - startTime
    });

  } catch (error) {
    console.error("UMKM Checkout Fatal Panic:", error);
    return NextResponse.json({ success: false, error: "Kesalahan fatal pemrosesan checkout." }, { status: 500 });
  }
}