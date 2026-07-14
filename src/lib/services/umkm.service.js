import { AppError } from '@/lib/api-wrapper';

const MIDTRANS_URL = process.env.MIDTRANS_API_URL || "https://app.sandbox.midtrans.com/snap/v1/transactions";
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY 
  ? Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64") 
  : null;

export class UmkmService {
  static async processCheckout({ supabase, user, items, deliveryAddress }) {
    if (!SERVER_KEY) throw new AppError("Kesalahan Konfigurasi Gateway.", 500);

    const productIds = items.map(i => i.productId);
    
    const { data: dbProducts, error: fetchErr } = await supabase
      .from("umkm_products")
      .select("id, name, price, stock, store_id")
      .in("id", productIds);

    if (fetchErr || !dbProducts || dbProducts.length !== items.length) {
      throw new AppError("Beberapa produk tidak ditemukan atau tidak valid.", 404);
    }

    let totalGrossAmount = 0;
    const verifiedItemsForMidtrans = [];
    const ordersToInsert = [];
    
    for (const item of items) {
      const dbProd = dbProducts.find(p => p.id === item.productId);
      const qty = parseInt(item.quantity, 10);
      
      if (dbProd.stock < qty) {
        throw new AppError(`Stok '${dbProd.name}' tidak cukup. Sisa: ${dbProd.stock}`, 400);
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

    const executedDeductions = [];
    
    try {
      await Promise.all(items.map(async (item) => {
        const dbProd = dbProducts.find(p => p.id === item.productId);
        const qty = parseInt(item.quantity, 10);
        
        const { data, error } = await supabase
          .from("umkm_products")
          .update({ stock: dbProd.stock - qty })
          .eq("id", item.productId)
          .eq("stock", dbProd.stock)
          .select("id")
          .single();

        if (error || !data) {
          throw new AppError(`Race condition terdeteksi pada produk ${dbProd.name}. Silakan coba lagi.`, 409);
        }
        
        executedDeductions.push({ id: item.productId, originalStock: dbProd.stock });
      }));
    } catch (err) {
      await Promise.all(executedDeductions.map(async (item) => {
        await supabase
          .from("umkm_products")
          .update({ stock: item.originalStock })
          .eq("id", item.id);
      }));
      throw err;
    }

    const { data: insertedOrders, error: orderInsertErr } = await supabase
      .from("umkm_orders")
      .insert(ordersToInsert)
      .select("id");
      
    if (orderInsertErr || !insertedOrders?.length) {
      throw new AppError("Gagal menyimpan rekam jejak pesanan.", 500);
    }

    const midtransOrderId = `MKM-${insertedOrders[0].id}-${Date.now()}`;
    
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
      throw new AppError("Payment Gateway menolak token.", 502);
    }

    await supabase
      .from("umkm_orders")
      .update({ payment_gateway_ref: midtransOrderId })
      .in("id", insertedOrders.map(o => o.id));

    return { snapToken: midtransData.token };
  }
}