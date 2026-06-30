import React from "react";
import { getSupabase } from "../../lib/supabase";
import HeroSection from "../../components/customer/HeroSection";
import Link from "next/link";
import { MapPin, Star, ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CustomerHomePage() {
  const supabase = getSupabase();
  
  // Hanya tampilkan arena olahraga yang sudah lulus verifikasi berkas oleh Super Admin
  const { data: approvedVenues } = await supabase
    .from("venues")
    .select("id, name, address, description")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-16 pb-20 bg-zinc-950">
      <HeroSection />

      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="flex flex-col space-y-1">
          <h2 className="text-xl font-black font-display tracking-tight text-white uppercase">
            Rekomendasi Arena Olahraga Terverifikasi
          </h2>
          <p className="text-xs text-zinc-500 font-mono">
            Fasilitas Olahraga Regional dengan Jaminan Anti-Double Booking Eksklusif
          </p>
        </div>

        {(!approvedVenues || approvedVenues.length === 0) ? (
          <div className="h-40 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-xs font-mono text-zinc-600">
            BELUM ADA ARENA OLAHRAGA YANG MEMENUHI SYARAT OPERASIONAL
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {approvedVenues.map((venue) => (
              <div key={venue.id} className="bg-zinc-900/50 border border-zinc-900 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-800 transition-all group relative">
                <div className="space-y-3">
                  <div className="h-44 w-full bg-zinc-950 rounded-lg border border-zinc-900 overflow-hidden relative">
                    <div className="absolute top-3 right-3 bg-zinc-900/90 border border-zinc-800 px-2 py-1 rounded text-[10px] font-mono text-brand-neon flex items-center gap-1">
                      <Star className="w-3 h-3 fill-brand-neon" />
                      <span>4.8</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-brand-neon transition-colors truncate">{venue.name}</h3>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs mt-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span className="truncate">{venue.address}</span>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed font-sans">{venue.description || "Tidak ada deskripsi tambahan."}</p>
                </div>

                <Link href={`/booking/${venue.id}`} className="mt-5 w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-mono text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all">
                  <span>PESAN JADWAL</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-neon" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}