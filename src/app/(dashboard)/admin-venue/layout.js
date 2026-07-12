// src/app/(dashboard)/admin-venue/layout.js
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import AdminVenueHeader from "@/components/admin-venue/AdminVenueHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";

export default async function AdminVenueLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  // Sekali lagi, getSession sudah cukup untuk level UI presentation.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // HANYA ambil nama untuk Header
  const { data: venue } = await supabase
    .from("venues")
    .select("name")
    .eq("owner_id", session.user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-white">
      <AdminVenueHeader venueName={venue?.name || "Setup Akun"} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
      <DashboardFooter />
    </div>
  );
}