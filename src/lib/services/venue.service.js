export async function getVerifiedVenues(supabase) {
  try {
    const { data: venues, error } = await supabase
      .from("venues")
      .select(`
        id, name, address, status, rating,
        fields ( price_per_hour, sport_type )
      `)
      .eq("status", "APPROVED")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Venue Service Error:", error);
      return [];
    }

    return (venues || []).map((v) => {
      // Ambil field dengan harga terendah sebagai harga acuan 'Mulai Dari'
      const prices = v.fields?.map(f => Number(f.price_per_hour)) || [];
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      
      // Ambil daftar tipe olahraga unik yang tersedia di venue tersebut
      const sports = [...new Set(v.fields?.map(f => f.sport_type).filter(Boolean))];

      return {
        id: v.id,
        name: v.name,
        location: v.address || "Bali, Indonesia",
        image: "/image/venue-fallback.svg", 
        rating: v.rating || 5.0, 
        price: minPrice > 0 ? `IDR ${minPrice.toLocaleString('id-ID')} / Jam` : "N/A",
        sport: sports.join(", ") || "Umum",
        tags: ["Verified", "Cashless"]
      };
    });
  } catch (err) {
    console.error("Critical Failure in Venue Service:", err);
    return [];
  }
}

export async function getVenueById(supabase, id) {
  try {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error(`Error fetching venue ${id}:`, err);
    return null;
  }
}