import React from "react";
import Image from "next/image";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Compass, ShieldAlert } from "lucide-react";
import MarketplaceClient from "../../components/customer/MarketplaceClient";

export const dynamic = 'force-dynamic';

export default async function CustomerMarketplacePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  // 1. Tarik Data Venue Nyata dari Database (Hanya yang APPROVED oleh Super Admin)
  const { data: venues, error } = await supabase
    .from("venues")
    .select("id, name, address, status")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Marketplace Fetch Error:", error);
  }

  // 2. Transformasi Data (Fallback jika schema DB dasar belum lengkap)
  const activeVenues = venues?.map(v => ({
    id: v.id,
    name: v.name,
    location: v.address || "Bali, Indonesia",
    // Data statis sementara untuk memperkaya UI hingga relasi tabel gambar/rating dibangun
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    price: "IDR 150,000 / Jam",
    sport: "Futsal",
    tags: ["Verified", "Cashless"]
  })) || [];

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans">
      {/* Immersive Hero Header */}
      <div className="relative h-[420px] overflow-hidden flex items-end">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200"
            alt="Sportix Premium Arena"
            fill
            sizes="100vw"
            unoptimized
            className="object-cover filter brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full pb-10 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-neon/10 border border-brand-neon/20 rounded-full text-xs text-brand-neon mb-4">
            <Compass className="w-3 h-3 animate-spin" />
            <span className="font-mono tracking-wider uppercase">Daftar Arena Terverifikasi Otonom</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 font-display">
            Exploration <span className="text-brand-emerald">Engine</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed">
            Sistem terintegrasi yang menarik data langsung dari master ledger. 100% Cashless, 100% Akuntabel.
          </p>
        </div>
      </div>

      {/* Strict Forfeit Policy Bar */}
      <div className="bg-surface-hover border-y border-zinc-800 py-3.5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-amber/10 flex items-center justify-center border border-brand-amber/20 text-brand-amber glow-amber shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-zinc-300">
                <span className="text-brand-amber font-bold uppercase font-mono tracking-wider">KEBIJAKAN NO-SHOW: </span>
                Terlambat masuk <span className="text-brand-amber font-bold">&gt;15 menit</span> menghanguskan tiket secara sepihak, dana disita 100%, dan slot sisa dirilis otomatis ke status <span className="text-brand-neon font-bold">AVAILABLE</span>.
              </p>
            </div>
          </div>
          <div className="bg-background px-3 py-1 rounded border border-zinc-800 text-micro font-mono text-zinc-500 shrink-0">
            SECURE CASHLESS PROTOCOL
          </div>
        </div>
      </div>

      {/* Komponen Interaktif diserahkan ke Client */}
      <MarketplaceClient initialVenues={activeVenues} />
      
    </div>
  );
}