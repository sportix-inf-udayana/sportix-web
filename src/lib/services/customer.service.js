export async function getVenueDetail(supabase, venueId) {
  try {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("id", venueId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Fetch Venue Detail Error (${venueId}):`, error);
    return { data: null, error };
  }
}

export async function getUmkmCatalog(supabase) {
  try {
    const { data: products, error } = await supabase
      .from("umkm_products")
      .select(`
        id, name, price, stock, description, image_url,
        umkm_stores!inner ( status )
      `)
      .eq("umkm_stores.status", "APPROVED")
      .gt("stock", 0)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { 
      products: (products || []).map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        desc: p.description || "Perlengkapan olahraga lokal.",
        image: p.image_url || "/image/hero-arena.jpg" // Fallback ke gambar lokal
      })), 
      error: null 
    };
  } catch (error) {
    console.error("UMKM Catalog Fetch Error:", error);
    return { products: [], error };
  }
}

export async function getUserTicketHistory(supabase, userId) {
  try {
    const { data: tickets, error } = await supabase
      .from("reservations")
      .select(`
        id, status, barcode_token, booking_date, start_time, total_amount,
        slots ( price, venues ( name ) )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const safeTickets = tickets || [];
    
    return { 
      tickets: safeTickets,
      activeTickets: safeTickets.filter(t => t.status === "CONFIRMED"), 
      error: null 
    };
  } catch (error) {
    console.error("Fetch User Tickets Error:", error);
    return { tickets: [], activeTickets: [], error };
  }
}