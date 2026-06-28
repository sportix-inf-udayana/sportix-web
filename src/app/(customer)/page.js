import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Menggunakan path relatif murni tanpa alias '@'
import { getVerifiedVenues } from "../../lib/services/venue.service";
import HeroSection from "../../components/customer/HeroSection";
import PolicyBar from "../../components/customer/PolicyBar";
import MarketplaceClient from "../../components/customer/MarketplaceClient";

export const dynamic = 'force-dynamic';

export default async function CustomerMarketplacePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  // 1. Mengambil data arena dari lapisan servis (Data Layer)
  const activeVenues = await getVerifiedVenues(supabase);

  // 2. Penyusunan struktur antarmuka menggunakan komponen modular
  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans">
      {/* Komponen Hero Header dengan Aset Gambar Lokal */}
      <HeroSection />

      {/* Bar Kebijakan Pembatalan Telat/No-Show */}
      <PolicyBar />

      {/* Komponen Interaktif Sisi Klien untuk Katalog Lapangan */}
      <MarketplaceClient initialVenues={activeVenues} />
    </div>
  );
}