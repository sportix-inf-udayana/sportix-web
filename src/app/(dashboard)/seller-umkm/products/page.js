import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseUser } from "../../../../lib/supabase";
// Asumsikan kamu memiliki komponen grid katalog untuk merender UI
import ProductCatalogClient from "../../../../components/umkm/ProductCatalogClient";

export const dynamic = 'force-dynamic';

export default async function UmkmProductsPage() {
  const cookieStore = cookies();
  
  const allCookies = cookieStore.getAll();
  const authCookie = allCookies.find(c => c.name.includes("auth-token"));
  const token = authCookie ? authCookie.value : "";
  
  const supabase = getSupabaseUser(token);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || user.user_metadata?.role !== 'UMKM_SELLER') redirect("/login");

  // Kueri terisolasi: PostgreSQL menolak kueri jika store_id tidak berelasi dengan auth.uid()
  const { data: products, error: productError } = await supabase
    .from("umkm_products")
    .select(`id, name, price, stock, description, image_url, status`)
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