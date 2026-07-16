// src/app/(customer)/venues/[id]/page.js
import { getVenueById } from '@/lib/services/customer.service';
import { getSupabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Phone, Info } from 'lucide-react';

export async function generateMetadata({ params }) {
  const supabase = getSupabaseAdmin();
  const venue = await getVenueById(supabase, params.id);
  if (!venue) return { title: 'Venue Not Found' };
  return { title: `${venue.name} - Sportix`, description: venue.description };
}

export default async function VenueDetailPage({ params }) {
  const supabase = getSupabaseAdmin();
  const venue = await getVenueById(supabase, params.id);
  if (!venue) notFound();

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-6 font-sans text-white">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="w-full h-64 md:h-96 bg-zinc-950 relative border-b border-zinc-800">
          {venue.images?.[0] ? (
            <Image src={venue.images[0]} alt={venue.name} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-zinc-700 font-mono text-xs tracking-widest uppercase">
              No Visual Asset
            </div>
          )}
          <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-xs font-mono px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-bold">{venue.rating || "5.0"}</span>
          </div>
        </div>
        
        <div className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1">
            <span className="text-[10px] font-mono text-brand-emerald font-bold tracking-widest uppercase mb-2 block">
              {venue.sport || "SPORT FACILITY"}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 font-display uppercase tracking-tight">{venue.name}</h1>
            
            <div className="flex flex-col gap-2 mb-8">
              <p className="text-zinc-400 text-sm flex items-center gap-2 font-mono">
                <MapPin className="w-4 h-4 text-zinc-500" /> {venue.address}
              </p>
              {venue.phone && (
                <p className="text-zinc-400 text-sm flex items-center gap-2 font-mono">
                  <Phone className="w-4 h-4 text-zinc-500" /> {venue.phone}
                </p>
              )}
            </div>
            
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-sm font-bold text-white mb-3 font-mono uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-emerald" /> FCLTY_DESC
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{venue.description || 'Tidak ada deskripsi spesifik.'}</p>
            </div>
          </div>
          
          <div className="w-full md:w-80 bg-zinc-950 p-6 rounded-xl border border-zinc-800 shrink-0 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-emerald" />
            <div className="mb-6">
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase block mb-1">Base Rate / Hour</span>
              <span className="text-3xl font-black text-white font-mono">Rp {Number(venue.price_per_hour).toLocaleString('id-ID')}</span>
            </div>
            <Link 
              href={`/booking/${venue.id}`}
              className="block w-full text-center bg-brand-emerald hover:bg-emerald-400 text-black py-4 rounded-xl font-black text-xs font-mono uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              SECURE A SLOT
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}