export async function getUmkmStoreAndProducts(supabase, userId) {
  const { data: store, error: storeError } = await supabase
    .from("umkm_stores")
    .select("id, name, status, venues(name)")
    .eq("owner_id", userId)
    .single();

  if (storeError || !store) {
    return { store: null, products: [], error: storeError };
  }

  const { data: products, error: productsError } = await supabase
    .from("umkm_products")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  return { store, products: products || [], error: productsError };
}

export async function getUmkmOrders(supabase, userId) {
  const { data: store, error: storeError } = await supabase
    .from("umkm_stores")
    .select("id")
    .eq("owner_id", userId)
    .single();

  if (storeError || !store) return { store: null, orders: [], error: storeError };

  const { data: orders, error: ordersError } = await supabase
    .from("umkm_orders")
    .select(`
      id, status, courier_name, delivery_address, created_at,
      umkm_products (name)
    `)
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  if (ordersError) console.error("Fetch UMKM Orders Error:", ordersError);

  return { store, orders: orders || [], error: ordersError };
}