// src/app/(dashboard)/seller-umkm/layout.js
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import UmkmHeader from "@/components/umkm/UmkmHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { USER_ROLES, APP_CONFIG } from "@/lib/constants";

export default async function SellerUmkmLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user || user.user_metadata?.role !== USER_ROLES.UMKM_SELLER) {
    redirect(APP_CONFIG.routes.auth.login);
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-white">
      <UmkmHeader activeRoute="dashboard" />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
      <DashboardFooter />
    </div>
  );
}