import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { Award } from "lucide-react";

// Path relatif murni
import { getUmkmCatalog } from "../../../../lib/services/customer.service";
import UmkmCatalogClient from "../../../../components/customer/UmkmCatalogClient";

export const dynamic = 'force-dynamic';

export default async function UmkmConsignmentPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  // Eksekusi Data Layer
  const { products } = await getUmkmCatalog(supabase);

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans select-none relative">
      <div className="border-b border-zinc-800 bg-surface-elevated py-6 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-neon glow-emerald">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white font-display">Athlete Dossier</h1>
              <p className="text-zinc-500 text-xs uppercase tracking-wider font-mono">
                Peralatan Konsinyasi Resmi
              </p>
            </div>
          </div>
          <Link
            href="/profile/history"
            className="text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3.5 py-2 rounded text-zinc-400 hover:text-white transition-all cursor-pointer font-sans font-medium"
          >
            Kembali ke Dossier
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex border-b border-zinc-800/80 gap-6 mb-8">
          <Link href="/profile/history" className="pb-4 text-sm font-semibold text-zinc-500 hover:text-zinc-300">
            My Tickets
          </Link>
          <Link href="/tournaments" className="pb-4 text-sm font-semibold text-zinc-500 hover:text-zinc-300">
            Tournaments
          </Link>
          <div className="pb-4 text-sm font-bold text-brand-neon relative">
            Consignment Pro Shop
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-neon glow-emerald" />
          </div>
        </div>

        {/* Delegasi Keranjang dan Filter ke Client Component */}
        <UmkmCatalogClient initialProducts={products} />
      </div>
    </div>
  );
}