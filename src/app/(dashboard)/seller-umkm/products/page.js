import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { PackageSearch, Store, Plus, AlertOctagon } from "lucide-react";

// Path relatif absolut sesuai instruksi
import { getUmkmStoreAndProducts } from "../../../../lib/services/umkm.service";

export const dynamic = 'force-dynamic';

export default async function UmkmProductsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return <div className="p-8 text-red-500 font-mono">Fatal: Akses Ditolak.</div>;
  }

  // Pengambilan data via Data Layer terpusat
  const { store, products, error: storeError } = await getUmkmStoreAndProducts(supabase, user.id);

  if (storeError || !store) {
    return (
      <div className="max-w-7xl mx-auto px-6 mt-8 border border-brand-amber/30 bg-brand-amber/10 p-6 rounded-xl">
        <h3 className="text-brand-amber font-bold flex items-center gap-2">
          <AlertOctagon className="w-5 h-5" /> Toko Belum Terdaftar
        </h3>
        <p className="text-zinc-400 text-sm mt-2">
          Sistem tidak dapat menemukan entitas toko yang terikat dengan akun Anda. Silakan hubungi Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 mt-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-mono text-zinc-500 tracking-wider uppercase block mb-1">
            KONSINYASI VENUE: {store.venues?.name || "TIDAK TERIKAT"}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display flex items-center gap-3">
            <Store className="w-8 h-8 text-brand-emerald" /> {store.name}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
              store.status === 'APPROVED' 
                ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/30' 
                : 'bg-brand-amber/10 text-brand-amber border-brand-amber/30'
            }`}>
              STATUS: {store.status}
            </span>
            <span className="text-zinc-400 text-xs">Kelola katalog inventaris alat olahraga Anda.</span>
          </div>
        </div>

        <button className="bg-brand-emerald hover:bg-emerald-400 text-black font-black py-2.5 px-5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <Plus className="w-4 h-4 font-bold" /> TAMBAH PRODUK BARU
        </button>
      </div>

      <div className="bg-surface border border-zinc-800 rounded-2xl overflow-hidden min-h-[400px]">
        {products && products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-900/50 font-mono text-xs uppercase border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4">Harga Konsinyasi</th>
                  <th className="px-6 py-4">Sisa Stok Fisik</th>
                  <th className="px-6 py-4">Status Etalase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {products.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-elevated transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{item.name}</td>
                    <td className="px-6 py-4 font-mono text-brand-neon">
                      Rp {Number(item.price).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 font-mono text-white">
                      {item.stock} Unit
                    </td>
                    <td className="px-6 py-4">
                      {item.stock > 0 ? (
                        <span className="text-brand-emerald font-mono text-micro bg-brand-emerald/10 px-2 py-1 rounded">TERSEDIA</span>
                      ) : (
                        <span className="text-red-400 font-mono text-micro bg-red-500/10 px-2 py-1 rounded">HABIS</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800 shadow-inner">
              <PackageSearch className="w-6 h-6 text-zinc-600" />
            </div>
            <h3 className="text-white font-bold mb-1">Katalog Kosong</h3>
            <p className="text-zinc-500 text-sm max-w-md">
              Anda belum mengunggah produk alat olahraga apa pun ke etalase venue ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}