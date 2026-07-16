// src/app/(dashboard)/seller-umkm/onboarding/page.js
import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import OnboardingClient from "@/components/umkm/OnboardingClient";
import { USER_ROLES, ENTITY_STATUS, APP_CONFIG } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export const metadata = { 
  title: "Onboarding UMKM | Sportix" 
};

export default async function SellerUmkmOnboardingPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== USER_ROLES.UMKM_SELLER) {
    redirect(APP_CONFIG.routes.auth.login);
  }

  const { data: store } = await supabase
    .from("umkm_stores")
    .select("status")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (store) {
    if (store.status === ENTITY_STATUS.PENDING) redirect("/seller-umkm/pending");
    if (store.status === ENTITY_STATUS.APPROVED) redirect("/seller-umkm/products");
  }

  return <OnboardingClient />;
}