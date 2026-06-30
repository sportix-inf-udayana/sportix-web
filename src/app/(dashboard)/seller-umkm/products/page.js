import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Package } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SellerUmkmProductsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'UMKM_SELLER') redirect("/login");

  const { data: store } = await supabase.from("umkm_stores").select("id, status").eq("owner_id", user.id).maybeSingle();

  if (!store) redirect("/seller-umkm/onboarding");
  if (store.status === 'PENDING') redirect("/seller-umkm/pending");
  if (store.status === 'REJECTED') redirect("/seller-umkm/onboarding");

  // Tarik data katalog produk jualan eksklusif toko bersangkutan
  const { data: products } = await supabase
    .from("umkm_products")
    .select("id, name, price, stock")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-white font-sans">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-5">
        <div className="flex flex-col">
          <h1 className="text-xl font-black font-display uppercase tracking-tight">Katalog Etalase Toko</h1>
          <p className="text-xs text-zinc-500 font-mono">Inventarisasi Komoditas Suku Cadang Olahraga Konsinyasi</p>
        </div>
        <button className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>TAMBAH KOMODITAS</span>
        </button>
      </div>

      {(!products || products.length === 0) ? (
        <div className="h-48 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-mono">
          <Package className="w-5 h-5 text-zinc-600" />
          <span>BELUM ADA PRODUK YANG DIUNGGAH DI ETALASE ANDA</span>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 font-bold">
                <th className="p-4">NAMA PRODUK</th>
                <th className="p-4">HARGA SATUAN</th>
                <th className="p-4 text-center">STOK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-950/30 transition-colors">
                  <td className="p-4 font-sans font-bold text-white">{product.name}</td>
                  <td className="p-4 text-brand-neon">IDR {product.price.toLocaleString("id-ID")}</td>
                  <td className="p-4 text-center font-bold text-white">{product.stock} Unit</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}