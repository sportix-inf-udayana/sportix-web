import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import CoachHeader from "../../../components/coach/CoachHeader";
import DashboardFooter from "../../../components/dashboard/DashboardFooter";

export const dynamic = 'force-dynamic';

export default async function CoachLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { data: coach } = await supabase
    .from("coaches")
    .select("status")
    .eq("owner_id", user?.id)
    .maybeSingle();

  const isApproved = coach?.status === "APPROVED";

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans relative">
      {isApproved ? (
        <>
          <CoachHeader />
          <div className="flex-1 flex flex-col relative z-10">
            <main className="flex-1 w-full">{children}</main>
          </div>
          <DashboardFooter />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-zinc-950 w-full relative z-20">
          <div className="w-full max-w-xl">{children}</div>
        </div>
      )}
    </div>
  );
}