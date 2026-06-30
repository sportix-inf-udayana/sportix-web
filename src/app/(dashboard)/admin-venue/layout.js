import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import AdminVenueHeader from "../../../components/admin-venue/AdminVenueHeader";
import DashboardFooter from "../../../components/dashboard/DashboardFooter";

export const dynamic = 'force-dynamic';

export default async function AdminVenueLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  // Ambil manifes pendaftaran lapangan milik pengguna aktif
  const { data: venue } = await supabase
    .from("venues")
    .select("status")
    .eq("owner_id", user?.id)
    .maybeSingle();

  const isApproved = venue?.status === "APPROVED";

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans relative">
      {/* FIX LAYOUT POLLUTION: Hanya render komponen navigasi lengkap jika akun terbukti sah & aktif */}
      {isApproved ? (
        <>
          <AdminVenueHeader />
          <div className="flex-1 flex flex-col relative z-10">
            <main className="flex-1 w-full">{children}</main>
          </div>
          <DashboardFooter />
        </>
      ) : (
        // Render container steril tanpa sidebar/header pengganggu bagi akun pending/onboarding
        <div className="flex-1 flex items-center justify-center bg-zinc-950 w-full relative z-20">
          <div className="w-full max-w-xl">{children}</div>
        </div>
      )}
    </div>
  );
}