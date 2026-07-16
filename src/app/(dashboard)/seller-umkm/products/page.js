// src/app/(dashboard)/seller-umkm/products/page.js
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import ProductCatalogClient from "@/components/umkm/ProductCatalogClient";
import { USER_ROLES, ENTITY_STATUS, APP_CONFIG } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export default async function UmkmProductsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== USER_ROLES.UMKM_SELLER) {
    redirect(APP_CONFIG.routes.auth.login);
  }

  const { data: store } = await supabase
    .from("umkm_stores")
    .select("id, status")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!store) redirect("/seller-umkm/onboarding");
  if (store.status === ENTITY_STATUS.PENDING) redirect("/seller-umkm/pending");
  if (store.status === ENTITY_STATUS.REJECTED) redirect("/seller-umkm/onboarding");

  const { data: products, error: productError } = await supabase
    .from("umkm_products")
    .select("id, name, price, stock, description, image_url, is_active")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  if (productError) {
    return (
      <div className="bg-red-950/20 border border-red-900 text-red-400 p-4 rounded-lg font-mono text-sm">
        [DATABASE ERROR]: Kegagalan muat data inventaris multi-tenant. {productError.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-white">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-black text-white font-display uppercase">Katalog Komoditas</h1>
        <p className="text-zinc-500 text-xs font-mono mt-1">Hanya menampilkan aset inventaris yang dikelola UID ini.</p>
      </div>
      <ProductCatalogClient initialProducts={products || []} />
    </div>
  );
}