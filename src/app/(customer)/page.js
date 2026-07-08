import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import HeroSection from "../../components/customer/HeroSection";
import MarketplaceClient from "../../components/customer/MarketplaceClient";
import { getVenueList } from "../../lib/services/customer.service";

export const dynamic = 'force-dynamic';

export default async function CustomerHomePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  
  const { venues } = await getVenueList(supabase);

  return (
    <div className="space-y-16 pb-20 bg-zinc-950 font-sans">
      <HeroSection />
      <MarketplaceClient initialVenues={venues} />
    </div>
  );
}