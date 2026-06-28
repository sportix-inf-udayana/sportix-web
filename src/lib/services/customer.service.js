// Mengambil detail satu venue berdasarkan ID
export async function getVenueDetail(supabase, venueId) {
  const { data: venue, error } = await supabase
    .from("venues")
    .select("*")
    .eq("id", venueId)
    .single();

  if (error) {
    console.error(`Fetch Venue Detail Error (${venueId}):`, error);
    return { venue: null, error };
  }
  return { venue, error: null };
}

// Mengambil katalog produk UMKM (Hanya dari toko yang APPROVED dan stok > 0)
export async function getUmkmCatalog(supabase) {
  const { data: products, error } = await supabase
    .from("umkm_products")
    .select(`
      id, name, price, stock, description,
      umkm_stores!inner ( status )
    `)
    .eq("umkm_stores.status", "APPROVED")
    .gt("stock", 0)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("UMKM Catalog Fetch Error:", error);
    return { products: [], error };
  }

  // Transformasi Fallback Mapping untuk UI
  const liveProducts = products?.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    desc: p.description || "Alat olahraga premium.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400"
  })) || [];

  return { products: liveProducts, error: null };
}

// Mengambil riwayat tiket reservasi milik pengguna
export async function getUserTicketHistory(supabase, userId) {
  const { data: tickets, error } = await supabase
    .from("reservations")
    .select(`
      id, 
      status, 
      barcode_token, 
      booking_date, 
      start_time,
      slots ( price, time, venues ( name ) )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch User Tickets Error:", error);
    return { tickets: [], activeTickets: [], error };
  }

  const activeTickets = tickets?.filter(t => t.status === "CONFIRMED") || [];
  return { tickets: tickets || [], activeTickets, error: null };
}