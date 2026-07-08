import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import AdminVenueHeader from "../../../components/admin-venue/AdminVenueHeader";
import DashboardFooter from "../../../components/dashboard/DashboardFooter";
import { USER_ROLES } from "../../../lib/constants";

export default async function AdminVenueLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== USER_ROLES.ADMIN_VENUE) redirect("/login");

  // HANYA ambil nama untuk Header, TANPA redirect
  const { data: venue } = await supabase
    .from("venues")
    .select("name")
    .eq("owner_id", user.id)
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