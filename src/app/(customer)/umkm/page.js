import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getUmkmCatalog } from "../../../lib/services/customer.service";
import UmkmCatalogClient from "../../../components/customer/UmkmCatalogClient";

export const dynamic = 'force-dynamic';

export default async function UmkmConsignmentPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { products } = await getUmkmCatalog(supabase);

  return (
    <div className="bg-zinc-950 text-white min-h-screen pb-16 font-sans select-none relative">
      <div className="border-b border-zinc-900 bg-zinc-950 py-6 px-6 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white font-display tracking-tight uppercase">Sports Store</h1>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono mt-0.5">
                Pusat Perlengkapan Ekosistem UMKM Sportix
              </p>
            </div>
          </div>
          <Link
            href="/profile/history"
            className="text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white transition-all uppercase tracking-widest"
          >
            MY TICKETS
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <UmkmCatalogClient initialProducts={products} />
      </div>
    </div>
  );
}