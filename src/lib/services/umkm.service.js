export async function getUmkmStoreAndProducts(supabase, userId) {
  try {
    const { data: store, error: storeError } = await supabase
      .from("umkm_stores")
      .select("id, name, status, venues(name)")
      .eq("owner_id", userId)
      .maybeSingle(); // Menggantikan .single() agar tidak throw error jika kosong

    if (storeError) throw storeError; 
    if (!store) return { data: { store: null, products: [] }, error: null };

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
    const { data: store, error: storeError } = await supabase
      .from("umkm_stores")
      .select("id")
      .eq("owner_id", userId)
      .maybeSingle();

    if (storeError) throw storeError;
    if (!store) return { data: { store: null, orders: [] }, error: null };

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