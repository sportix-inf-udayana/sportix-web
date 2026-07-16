// src/app/(customer)/umkm/page.js
import { getSupabaseAdmin } from '@/lib/supabase';
import UmkmCatalogClient from '@/components/customer/UmkmCatalogClient';
import { getUmkmProducts } from '@/lib/services/customer.service';

export const metadata = {
  title: 'UMKM Marketplace - Sportix',
  description: 'Dukung UMKM lokal dan temukan perlengkapan olahraga terbaik.',
};

export const revalidate = 60;

export default async function UmkmPage() {
  const supabase = getSupabaseAdmin();
  const initialProducts = await getUmkmProducts(supabase).catch(() => []);

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 w-full font-sans text-white">
      <header className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black font-display uppercase tracking-tight text-white">UMKM Marketplace</h1>
        <p className="text-zinc-400 text-xs font-mono mt-1">Eksplorasi dan dukung penyedia perlengkapan olahraga lokal.</p>
      </header>
      
      <UmkmCatalogClient initialProducts={initialProducts} />
    </main>
  );
}