import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  ArrowLeft, MapPin, Star, Shield, Award, Layers,
  Share2, Heart, Calendar, AlertCircle
} from "lucide-react";

// Path relatif murni
import { getVenueDetail } from "../../../../lib/services/customer.service";

export const dynamic = 'force-dynamic';

export default async function VenueDetailPage({ params }) {
  const { id } = params; 
  
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  // Panggil Data Layer Terpusat
  const { venue, error } = await getVenueDetail(supabase, id);

  if (error || !venue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
         <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2 font-display">Arena Tidak Ditemukan</h1>
            <p className="text-zinc-400 text-sm mb-6">Fasilitas olahraga dengan ID yang diminta tidak ada di pangkalan data kami atau belum disetujui Super Admin.</p>
            <Link href="/" className="bg-zinc-800 text-white px-6 py-2 rounded-lg font-bold text-sm">Kembali ke Beranda</Link>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans">
      <div className="border-b border-zinc-800 bg-surface-elevated py-4 px-6 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Exploration</span>
          </Link>
          <div className="flex gap-2">
            <button className="p-2 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer">
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        {/* Sisanya menggunakan variabel venue dengan aman */}
        <div className="relative h-[480px] rounded-xl overflow-hidden mb-8 group shadow-2xl bg-zinc-950">
          <Image
            src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200"
            alt={venue.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-brand-emerald text-black text-micro font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider glow-emerald">
                  Verified Complex
                </span>
                <span className="bg-zinc-800/80 backdrop-blur border border-zinc-700 text-white text-micro font-mono px-2 py-0.5 rounded">
                  {venue.id.substring(0,8)}...
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 font-display">
                {venue.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-zinc-300 font-sans">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{venue.address || "Lokasi belum dilengkapi"}</span>
                </div>
                <div className="flex items-center gap-1 text-brand-amber">
                  <Star className="w-4 h-4 fill-brand-amber text-brand-amber" />
                  <span className="font-bold">4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface-elevated border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 font-display">Detail Arena</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-background rounded border border-zinc-800/60 flex items-center gap-3">
                  <Layers className="w-5 h-5 text-brand-neon" />
                  <div>
                    <span className="text-micro font-mono text-zinc-500 block uppercase">STATUS HUKUM</span>
                    <span className="text-xs font-bold text-white">{venue.status}</span>
                  </div>
                </div>
                <div className="p-3 bg-background rounded border border-zinc-800/60 flex items-center gap-3">
                  <Award className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="text-micro font-mono text-zinc-500 block uppercase">OWNER ID</span>
                    <span className="text-xs font-bold text-white font-mono break-all">{venue.owner_id?.substring(0,6)}..</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-sm text-zinc-400 leading-relaxed space-y-4 font-sans">
                <p>Data venue ini ditarik secara langsung dari relasi tabel master PostgreSQL. Setiap pemesanan lapangan akan menggunakan Slot Locking Agent otonom.</p>
              </div>
            </div>

            <div className="bg-amber-950/20 border border-brand-amber/30 rounded-xl p-6">
              <h3 className="text-brand-amber text-sm font-bold font-mono tracking-wider uppercase mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-brand-amber" /> Kepatuhan Regulasi Sportix (SLA)
              </h3>
              <ul className="space-y-3.5 text-xs text-zinc-400 font-sans">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-amber shrink-0 mt-1.5" />
                  <span><strong className="text-white">Kebijakan Hangus 15 Menit:</strong> Terlambat check-in &gt;15 menit akan menghanguskan tiket secara otomatis tanpa pengecualian.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-amber shrink-0 mt-1.5" />
                  <span><strong className="text-white">Full Cashless:</strong> Kami tidak menerima pembayaran tunai di tempat. Verifikasi QR Code E-Ticket Anda di pintu masuk.</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-surface-elevated border border-zinc-800 rounded-2xl p-6 sticky top-24 shadow-2xl">
              <h3 className="text-xs font-mono text-zinc-500 tracking-wider uppercase mb-4">RESERVASI</h3>

              <div className="space-y-3.5 mb-6">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-sans">
                  <Shield className="w-4 h-4 text-brand-emerald shrink-0" />
                  <span>Slot dijamin Anti-Double Booking</span>
                </div>
              </div>

              <Link
                href={`/booking/${venue.id}`}
                className="w-full bg-brand-emerald hover:bg-emerald-400 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 tracking-wide text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <span>Lihat Jadwal Slot</span>
                <Calendar className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}