import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import UmkmCatalogClient from '@/components/customer/UmkmCatalogClient';
import { getUmkmProducts } from '@/lib/services/customer.service';

export const metadata = {
  title: 'UMKM Marketplace - Sportix',
  description: 'Support local sports merchants and buy equipments.',
};

export default async function UmkmPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // Fetching data di server, menghilangkan load state di client
  const initialProducts = await getUmkmProducts(supabase);

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">UMKM Marketplace</h1>
        <p className="text-gray-600 mt-2">Discover and support local sports merchants.</p>
      </header>

      {/* Komponen interaktif yang murni menangani filter, search, dan cart */}
      <UmkmCatalogClient initialProducts={initialProducts} />
    </main>
  );
}