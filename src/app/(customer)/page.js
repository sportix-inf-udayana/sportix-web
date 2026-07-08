import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import HeroSection from "../../components/customer/HeroSection";
import MarketplaceClient from "../../components/customer/MarketplaceClient";

export const dynamic = 'force-dynamic';

export default async function CustomerHomePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  
  // Join query dengan fields untuk mendapatkan data harga dan jenis olahraga
  const { data: venues } = await supabase
    .from("venues")
    .select("id, name, address, description, rating, fields(price_per_hour, sport_type)")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false });

  // Formatting data agar kompatibel dengan props MarketplaceClient
  const formattedVenues = (venues || []).map(v => {
    const prices = v.fields?.map(f => Number(f.price_per_hour)) || [];
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const sports = [...new Set(v.fields?.map(f => f.sport_type).filter(Boolean))];

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

  return (
    <div className="space-y-16 pb-20 bg-zinc-950 font-sans">
      <HeroSection />
      <MarketplaceClient initialVenues={formattedVenues} />
    </div>
  );
}