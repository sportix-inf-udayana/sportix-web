import React from "react";
import CustomerHeader from "@/components/customer/CustomerHeader";
import HeroSection from "@/components/customer/HeroSection";
import PolicyBar from "@/components/customer/PolicyBar";
import MarketplaceClient from "@/components/customer/MarketplaceClient";
import CustomerFooter from "@/components/customer/CustomerFooter";
import { getSupabase } from "@/lib/supabase";

export const metadata = {
  title: "SPORTIX | Sistem Reservasi Lapangan Otonom",
  description: "Platform booking lapangan olahraga cashless & otonom dengan ekosistem terdesentralisasi.",
};

export const revalidate = 60; // ISR - revalidate every 60 seconds

export default async function HomePage() {
  const supabase = getSupabase();
  let initialVenues = [];

  try {
    // Fetch initial active venues for the marketplace
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      // .eq("status", "ACTIVE") // Opsional: Sesuaikan dengan skema database Anda
      .order("created_at", { ascending: false })
      .limit(12);

    if (!error && data) {
      initialVenues = data;
    } else if (error) {
      console.error("Supabase fetch error:", error.message);
    }
  } catch (err) {
    console.error("Failed to fetch initial venues:", err);
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col selection:bg-brand-emerald/30 selection:text-brand-emerald">
      <CustomerHeader />
      
      <main className="flex-1 w-full flex flex-col pb-24">
        <HeroSection />
        <PolicyBar />
        <MarketplaceClient initialVenues={initialVenues} />
      </main>

      <CustomerFooter />
    </div>
  );
}