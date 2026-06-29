import React from "react";

export const dynamic = 'force-dynamic';

export default async function UmkmProductsPage() {
  return (
    <div className="w-full space-y-6">
      <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Katalog Konsinyasi</h1>
          <p className="text-sm text-brand-slate mt-1">
            Kelola stok dan harga instrumen olahraga untuk pelanggan arena.
          </p>
        </div>
        
        <button className="px-4 py-2 bg-brand-emerald text-background font-mono text-sm font-bold rounded-lg hover:bg-brand-emerald/90 transition-colors">
          + TAMBAH ITEM
        </button>
      </div>

      <div className="p-8 border border-zinc-800 border-dashed rounded-xl flex items-center justify-center bg-zinc-900/50">
        <p className="text-brand-slate font-mono text-sm">GRID PRODUK KOSONG</p>
      </div>
    </div>
  );
}