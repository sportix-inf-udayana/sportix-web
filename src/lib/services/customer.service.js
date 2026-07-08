export async function getVenueList(supabase) {
  try {
    const { data: venues, error } = await supabase
      .from("venues")
      .select("id, name, address, description, rating, fields(price_per_hour, sport_type)")
      .eq("status", "APPROVED")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedVenues = (venues || []).map(v => {
      const prices = v.fields?.map(f => Number(f.price_per_hour)) || [];
      const minPrice = prices.length ? Math.min(...prices) : 0;
      
      const allSports = v.fields?.map(f => f.sport_type).filter(Boolean) || [];
      const sports = allSports.filter((item, index) => allSports.indexOf(item) === index);

      return {
        id: v.id,
        name: v.name,
        location: v.address || "Lokasi tidak diketahui",
        description: v.description,
        image: "/image/hero-arena.jpg",
        rating: v.rating || 5.0,
        price: minPrice ? `Rp ${minPrice.toLocaleString('id-ID')}/Jam` : "N/A",
        sport: sports.length > 0 ? sports[0] : "Umum",
      };
    });

    return { venues: formattedVenues, error: null };
  } catch (error) {
    console.error("Fetch Venue List Error:", error);
    return { venues: [], error };
  }
}

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
        image: p.image_url || "/image/hero-arena.jpg"
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