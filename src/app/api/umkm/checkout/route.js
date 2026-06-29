import { NextResponse } from "next/server";
import { getSupabase } from "../../../../lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) return new NextResponse("Service Unavailable", { status: 503 });

    // Otorisasi Pengguna Tingkat Server 
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Akses Ditolak. Sesi otorisasi hilang." }, { status: 401 });
    }

    const body = await req.json();
    const { items, deliveryAddress } = body; // items: [{ productId, quantity }]

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Keranjang belanja kosong." }, { status: 400 });
    }

    const safeAddress = deliveryAddress?.trim() || "Ambil di Pro-Shop Venue (Pick-Up)";
    let totalGrossAmount = 0;
    const verifiedItemsForMidtrans = [];
    const ordersToInsert = [];

    // SERVER-SIDE RE-CALCULATION & STOCK VERIFICATION 
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        return NextResponse.json({ success: false, message: "Struktur item payload tidak valid." }, { status: 400 });
      }

      // Tarik harga dan stok resmi langsung dari Database Master
      const { data: product, error: prodErr } = await supabase
        .from("umkm_products")
        .select("id, name, price, stock, store_id")
        .eq("id", productId)
        .single();

      if (prodErr || !product) {
        return NextResponse.json({ success: false, message: `Produk dengan ID ${productId} tidak ditemukan.` }, { status: 404 });
      }

      // Validasi Kecukupan Stok Fisik di Server
      if (product.stock < quantity) {
        return NextResponse.json({ 
          success: false, 
          message: `Gagal Checkout: Stok untuk '${product.name}' tidak mencukupi. Sisa: ${product.stock} unit.` 
        }, { status: 409 });
      }

      // Hitung total harga secara aman di server
      const itemSubtotal = Number(product.price) * parseInt(quantity, 10);
      totalGrossAmount += itemSubtotal;

      // Siapkan payload untuk manifes manifes Midtrans
      verifiedItemsForMidtrans.push({
        id: product.id,
        price: Number(product.price),
        quantity: parseInt(quantity, 10),
        name: product.name.substring(0, 50) // Batasan karakter nama Midtrans
      });

      // Siapkan array data untuk record tabel umkm_orders
      ordersToInsert.push({
        user_id: user.id,
        store_id: product.store_id,
        product_id: product.id,
        quantity: parseInt(quantity, 10),
        delivery_address: safeAddress,
        status: "PENDING_PAYMENT", // Mengunci status hingga webhook settlement masuk
        total_price: itemSubtotal
      });
    }

    // INVENTORY LOCKING (Kurangi Stok Seketika)
    for (const orderItem of ordersToInsert) {
      // Ambil stok teraktual kembali untuk mengantisipasi jeda balapan mikrodetik
      const { data: currentProd } = await supabase.from("umkm_products").select("stock").eq("id", orderItem.product_id).single();
      const newStock = currentProd.stock - orderItem.quantity;

      const { error: stockDeductErr } = await supabase
        .from("umkm_products")
        .update({ stock: newStock })
        .eq("id", orderItem.product_id);

      if (stockDeductErr) throw new StockDeductErr("Gagal mengunci stok komoditas.");
    }

    // Injeksi Data Pesanan Terkonsolidasi ke Tabel Umkm Orders
    const { data: insertedOrders, error: orderInsertErr } = await supabase
      .from("umkm_orders")
      .insert(ordersToInsert)
      .select("id");

    if (orderInsertErr) {
      // Rollback manual jika gagal insert order (Kembalikan stok barang)
      for (const orderItem of ordersToInsert) {
        const { data: currentProd } = await supabase.from("umkm_products").select("stock").eq("id", orderItem.product_id).single();
        await supabase.from("umkm_products").update({ stock: currentProd.stock + orderItem.quantity }).eq("id", orderItem.product_id);
      }
      throw orderInsertErr;
    }

    // Gunakan ID pesanan pertama sebagai jangkar referensi eksternal (External Reference ID)
    const primaryOrderId = insertedOrders[0].id;
    const midtransOrderId = `UMKM-${primaryOrderId}`;

    // INTEGRASI REST API GATEWAY MIDTRANS SNAP (SERVER-TO-SERVER)
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
    if (!midtransServerKey) {
      return NextResponse.json({ success: false, message: "Kesalahan Konfigurasi Gateway Server." }, { status: 500 });
    }

    const midtransPayload = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: totalGrossAmount
      },
      item_details: verifiedItemsForMidtrans,
      customer_details: {
        email: user.email,
        first_name: user.user_metadata?.full_name || "Athlete Customer"
      },
      expiry: {
        start_time: new Date().toISOString().replace("T", " ").substring(0, 19) + " +0800",
        unit: "minutes",
        duration: 15 // Batas waktu pembayaran checkout UMKM disamakan 15 menit agar adil untuk stok
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
      console.error("Midtrans Gate Refusal:", midtransData);
      // Rollback stok jika token payment gateway ditolak
      for (const orderItem of ordersToInsert) {
        const { data: currentProd } = await supabase.from("umkm_products").select("stock").eq("id", orderItem.product_id).single();
        await supabase.from("umkm_products").update({ stock: currentProd.stock + orderItem.quantity }).eq("id", orderItem.product_id);
      }
      return NextResponse.json({ success: false, message: "Payment Gateway menolak pembuatan token transaksi." }, { status: 502 });
    }

    // Perbarui seluruh order terkait dengan referensi token Midtrans Snap riil
    const orderUuids = insertedOrders.map(o => o.id);
    await supabase
      .from("umkm_orders")
      .update({ payment_gateway_ref: midtransOrderId })
      .in("id", orderUuids);

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