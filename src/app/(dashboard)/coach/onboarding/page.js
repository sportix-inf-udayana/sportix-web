// src/app/(dashboard)/coach/onboarding/page.js
import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import OnboardingClient from "@/components/coach/OnboardingClient";
import { USER_ROLES, ENTITY_STATUS, APP_CONFIG } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export const metadata = { 
  title: "Onboarding Coach | Sportix" 
};

export default async function CoachOnboardingPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user || user.user_metadata?.role !== USER_ROLES.COACH) {
    redirect(APP_CONFIG.routes.auth.login);
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (coach) {
    if (coach.status === ENTITY_STATUS.PENDING) redirect("/coach/pending");
    if (coach.status === ENTITY_STATUS.APPROVED) redirect("/coach/schedule");
  }

  return <OnboardingClient />;
}