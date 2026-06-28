export async function getUmkmStoreAndProducts(supabase, userId) {
  try {
    // 1. Ambil data toko
    const { data: store, error: storeError } = await supabase
      .from("umkm_stores")
      .select("id, name, status, venues(name)")
      .eq("owner_id", userId)
      .single();

    if (storeError) throw storeError;
    if (!store) return { data: { store: null, products: [] }, error: null };

    // 2. Ambil produk berdasarkan store_id
    const { data: products, error: productsError } = await supabase
      .from("umkm_products")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false });

    if (productsError) throw productsError;

    return { 
      data: { store, products: products || [] }, 
      error: null 
    };
  } catch (error) {
    console.error("Fetch UMKM Store/Products Error:", error);
    return { data: null, error };
  }
}

export async function getUmkmOrders(supabase, userId) {
  try {
    // 1. Ambil data toko
    const { data: store, error: storeError } = await supabase
      .from("umkm_stores")
      .select("id")
      .eq("owner_id", userId)
      .single();

    if (storeError) throw storeError;
    if (!store) return { data: { store: null, orders: [] }, error: null };

    // 2. Ambil pesanan toko
    const { data: orders, error: ordersError } = await supabase
      .from("umkm_orders")
      .select(`
        id, status, courier_name, delivery_address, created_at,
        umkm_products (name)
      `)
      .eq("store_id", store.id)
      .order("created_at", { ascending: false });

    if (ordersError) throw ordersError;

    return { 
      data: { store, orders: orders || [] }, 
      error: null 
    };
  } catch (error) {
    console.error("Fetch UMKM Orders Error:", error);
    return { data: null, error };
  }
}