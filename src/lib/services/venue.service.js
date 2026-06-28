export async function getVerifiedVenues(supabase) {
  const { data: venues, error } = await supabase
    .from("venues")
    .select("id, name, address, status")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Marketplace Fetch Error:", error);
    return [];
  }


  return venues?.map(v => ({
    id: v.id,
    name: v.name,
    location: v.address || "Bali, Indonesia",
    image: "/images/venue-fallback.jpg", 
    rating: 4.8,
    price: "IDR 150,000 / Jam",
    sport: "Futsal",
    tags: ["Verified", "Cashless"]
  })) || [];
}