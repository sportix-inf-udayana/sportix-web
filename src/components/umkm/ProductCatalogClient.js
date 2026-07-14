"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Package, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function ProductCatalogClient() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = getSupabase();

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Akses ditolak.");

        const { data: store } = await supabase.from("umkm_stores").select("id").eq("owner_id", user.id).single();
        if (!store) throw new Error("Data toko tidak ditemukan.");

        const { data, error } = await supabase
          .from("umkm_products")
          .select("*")
          .eq("store_id", store.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (isMounted) setProducts(data || []);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => { isMounted = false; };
  }, [supabase]);

  return (
    <div className="space-y-6 w-full text-white font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display uppercase">Inventaris Produk</h1>
          <p className="text-zinc-500 text-xs font-mono mt-1">Kelola katalog perlengkapan olahraga Anda.</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-not-allowed opacity-50 shadow-md">
          <Plus className="w-4 h-4" />
          <span>TAMBAH PRODUK (SEGERA)</span>
        </button>
      </div>
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {loading ? (
        <div className="h-40 flex flex-col items-center justify-center gap-3 border border-zinc-800 border-dashed rounded-xl text-purple-500">
           <Loader2 className="w-6 h-6 animate-spin" />
           <span className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-500">Mensinkronisasi Katalog...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center gap-3 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/50">
           <Package className="w-8 h-8 text-zinc-700" />
           <span className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-500">INVENTARIS KOSONG</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 group hover:border-purple-500/50 transition-colors">
              <div className="h-32 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center relative overflow-hidden">
                 {product.image_url ? (
                   <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                 ) : (
                   <Package className="w-8 h-8 text-zinc-700" />
                 )}
              </div>
              <div>
                <h3 className="font-bold text-sm truncate">{product.name}</h3>
                <p className="text-purple-400 font-mono text-xs font-bold mt-1">Rp {product.price.toLocaleString('id-ID')}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-zinc-500 font-mono">Stok: {product.stock}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded-md transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}