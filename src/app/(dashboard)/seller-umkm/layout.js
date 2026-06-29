import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import UmkmHeader from "../../../components/umkm/UmkmHeader";
import DashboardFooter from "../../../components/dashboard/DashboardFooter";

export const dynamic = 'force-dynamic';

export default async function SellerUmkmLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "UMKM_SELLER") {
    redirect("/login");
  }

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col font-sans">
      {/* Header Manajemen Merchant */}
      <UmkmHeader user={user} />
      
      {/* Konten Produk & Pesanan Konsinyasi */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer Internal Dashboard Terpusat */}
      <DashboardFooter />
    </div>
  );
}