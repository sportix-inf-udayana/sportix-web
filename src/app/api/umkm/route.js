import { getSupabase } from "@/lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) return new Response("Service Unavailable", { status: 503 });

    // 1. Validasi Sesi JWT Mutlak
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const { cartItems, shippingAddress } = body; 
    // cartItems format: [{ productId: "uuid", quantity: 2 }, ...]

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0 || !shippingAddress) {
      return new Response(JSON.stringify({ success: false, message: "Invalid cart payload or missing address." }), { status: 400 });
    }

    // 2. SERVER-SIDE CART VALIDATION (Pencegahan Price Manipulation)
    let calculatedTotalAmount = 0;
    const validatedOrderItems = [];

    for (const item of cartItems) {
      const { data: productData, error: prodErr } = await supabase
        .from("umkm_products")
        .select("price, stock")
        .eq("id", item.productId)
        .single();

      if (prodErr || !productData) {
        return new Response(JSON.stringify({ success: false, message: `Product ${item.productId} not found.` }), { status: 404 });
      }

      if (productData.stock < item.quantity) {
        return new Response(JSON.stringify({ success: false, message: "Insufficient stock for one or more items." }), { status: 409 });
      }

      const itemTotal = Number(productData.price) * Number(item.quantity);
      calculatedTotalAmount += itemTotal;

      validatedOrderItems.push({
        product_id: item.productId,
        quantity: item.quantity,
        price: productData.price // Harga eceran saat transaksi terjadi
      });
    }

    // 3. Pembuatan Induk Transaksi
    const { data: orderHeader, error: orderErr } = await supabase
      .from("umkm_orders")
      .insert({
        user_id: user.id,
        total_amount: calculatedTotalAmount, // Menggunakan total perhitungan server, BUKAN dari klien
        shipping_address: shippingAddress,
        status: "PENDING"
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // 4. Injeksi Rincian Item (Order Items)
    const orderItemsToInsert = validatedOrderItems.map(item => ({
      order_id: orderHeader.id,
      ...item
    }));

    const { error: itemInsertErr } = await supabase
      .from("umkm_order_items")
      .insert(orderItemsToInsert);

    if (itemInsertErr) {
      // Rollback manual (Idealnya pakai RPC untuk Postgres transaction blok utuh)
      await supabase.from("umkm_orders").delete().eq("id", orderHeader.id);
      throw itemInsertErr;
    }

    return new Response(JSON.stringify({
      success: true,
      message: "UMKM Order validated and locked.",
      orderId: orderHeader.id,
      calculatedAmount: calculatedTotalAmount,
      executionMs: Date.now() - startTime
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}