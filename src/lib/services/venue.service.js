export async function getVerifiedVenues(supabase) {
  try {
    const { data: venues, error } = await supabase
      .from("venues")
      .select("id, name, address, status")
      .eq("status", "APPROVED")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Venue Service Error:", error);
      return [];
    }

    // Transformasi data 
    return (venues || []).map((v) => ({
      id: v.id,
      name: v.name,
      location: v.address || "Bali, Indonesia",
      // FIX: Hapus awalan '/public' karena Next.js mengekspos isi public secara langsung
      image: "/image/venue-fallback.svg", 
      rating: 4.8, 
      price: "IDR 150,000 / Jam",
      sport: "Futsal",
      tags: ["Verified", "Cashless"]
    }));
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