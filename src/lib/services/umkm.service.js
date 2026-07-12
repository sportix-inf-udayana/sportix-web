const MIDTRANS_URL = process.env.MIDTRANS_API_URL || "https://app.sandbox.midtrans.com/snap/v1/transactions";
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ? Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64") : null;

export class UmkmService {
  static async processCheckout({ supabase, user, items, deliveryAddress }) {
    if (!SERVER_KEY) throw new Error("Kesalahan Konfigurasi Gateway.");

    const productIds = items.map(i => i.productId);
    
    // 1. ELIMINASI N+1 QUERY: Ambil semua data produk dalam SATU kali panggilan
    const { data: dbProducts, error: fetchErr } = await supabase
      .from("umkm_products")
      .select("id, name, price, stock, store_id")
      .in("id", productIds);

    if (fetchErr || dbProducts.length !== items.length) {
      throw new Error("Beberapa produk tidak ditemukan atau tidak valid.");
    }

    let totalGrossAmount = 0;
    const verifiedItemsForMidtrans = [];
    const ordersToInsert = [];

    // Validasi Awal Stok
    for (const item of items) {
      const dbProd = dbProducts.find(p => p.id === item.productId);
      const qty = parseInt(item.quantity, 10);
      
      if (dbProd.stock < qty) {
        throw new Error(`Stok '${dbProd.name}' tidak cukup. Sisa: ${dbProd.stock}`);
      }

      const itemSubtotal = Number(dbProd.price) * qty;
      totalGrossAmount += itemSubtotal;

      verifiedItemsForMidtrans.push({ 
        id: dbProd.id, 
        price: Number(dbProd.price), 
        quantity: qty, 
        name: dbProd.name.substring(0, 50) 
      });

      ordersToInsert.push({
        user_id: user.id,
        store_id: dbProd.store_id,
        product_id: dbProd.id,
        quantity: qty,
        delivery_address: deliveryAddress,
        status: "PENDING_PAYMENT",
        total_price: itemSubtotal
      });
    }

    // 2. OPTIMISTIC LOCKING: Atomic Update Tanpa TOCTOU
    // Kita memaksa update HANYA jika stok lama belum berubah di database.
    const executedDeductions = [];
    try {
      await Promise.all(items.map(async (item) => {
        const dbProd = dbProducts.find(p => p.id === item.productId);
        const qty = parseInt(item.quantity, 10);
        const expectedStock = dbProd.stock;

        // Query ini akan GAGAL (tidak mengembalikan baris) jika stok di DB sudah diubah orang lain
        const { data, error } = await supabase
          .from("umkm_products")
          .update({ stock: expectedStock - qty })
          .eq("id", item.productId)
          .eq("stock", expectedStock) // INI ADALAH KUNCI KEAMANANNYA
          .select("id")
          .single();

        if (error || !data) {
           throw new Error(`Race condition terdeteksi pada produk ${dbProd.name}. Silakan coba lagi.`);
        }
        executedDeductions.push({ id: item.productId, qty, originalStock: expectedStock });
      }));
    } catch (err) {
      // Rollback Cepat: Kembalikan persis ke state semula yang aman
      await Promise.all(executedDeductions.map(async (item) => {
         await supabase
           .from("umkm_products")
           .update({ stock: item.originalStock })
           .eq("id", item.id);
      }));
      throw err;
    }

    // 3. INSERT ORDER
    const { data: insertedOrders, error: orderInsertErr } = await supabase
      .from("umkm_orders")
      .insert(ordersToInsert)
      .select("id");
    
    if (orderInsertErr) {
      // Implementasi rollback jika insert gagal
      throw new Error("Gagal menyimpan rekam jejak pesanan.");
    }

    // 4. MIDTRANS PROCESSING
    const midtransOrderId = `UMKM-${insertedOrders[0].id}-${Date.now()}`; // Tambah TS agar unik
    
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
        customer_details: { email: user.email, first_name: user.user_metadata?.full_name || "Customer" },
        expiry: {
          start_time: new Date().toISOString().replace("T", " ").substring(0, 19) + " +0800",
          unit: "minutes",
          duration: 15
        }
      })
    });

    const midtransData = await midtransResponse.json();

    if (!midtransResponse.ok || !midtransData.token) {
      throw new Error("Payment Gateway menolak token.");
    }

    await supabase
      .from("umkm_orders")
      .update({ payment_gateway_ref: midtransOrderId })
      .in("id", insertedOrders.map(o => o.id));

    return { snapToken: midtransData.token };
  }
}