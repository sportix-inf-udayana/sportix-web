import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
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

  // Ambil data user secara aman langsung dari session server
  const { data: { user } } = await supabase.auth.getUser();

  // Proteksi berlapis tingkat server
  if (!user || user.user_metadata?.role !== "ADMIN_VENUE") {
    redirect("/login");
  }

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col font-sans">
      {/* Header Operator Lapangan */}
      <AdminVenueHeader user={user} />
      
      {/* Konten Halaman */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer Internal Dashboard Terpusat */}
      <DashboardFooter />
    </div>
  );
}