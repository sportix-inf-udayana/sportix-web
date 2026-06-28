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

    // Transformasi data agar sesuai dengan kontrak UI
    return (venues || []).map((v) => ({
      id: v.id,
      name: v.name,
      location: v.address || "Bali, Indonesia",
      image: "/public/image/venue-fallback.svg", // Menggunakan path yang benar
      rating: 4.8, // Placeholder: Bisa ditambahkan kolom rating di DB nanti
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