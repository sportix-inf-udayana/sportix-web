import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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

  const activeVenues = await getVerifiedVenues(supabase);

  return (
    <div className="pb-16">
      <HeroSection />
      <PolicyBar />
      <MarketplaceClient initialVenues={activeVenues} />
    </div>
  );
}