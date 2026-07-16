// src/app/(customer)/page.js
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import HeroSection from '@/components/customer/HeroSection';
import { getFeaturedVenues } from '@/lib/services/customer.service';

export const metadata = {
  title: 'Dashboard - Sportix',
  description: 'Sistem reservasi lapangan olahraga otonom dan cashless terdepan.',
};

export const revalidate = 60; 

const VenueCard = ({ venue }) => (
  <Link 
    href={`/booking/${venue.id}`} 
    className="group block bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-lg hover:border-brand-emerald/50 transition-all duration-300 hover:-translate-y-1"
  >
    <div className="relative h-48 bg-zinc-950 w-full overflow-hidden border-b border-zinc-800">
      {venue.images?.[0] ? (
        <Image 
          src={venue.images[0]} 
          alt={venue.name} 
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
          sizes="(max-width: 768px) 100vw, 25vw"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-700 font-mono text-[10px] uppercase tracking-widest">
          No Visual
        </div>
      )}
    </div>
    <div className="p-5">
      <span className="text-[10px] font-mono font-bold text-brand-emerald tracking-widest uppercase block mb-2">
        {venue.sport || "MULTISPORT"}
      </span>
      <h3 className="font-bold text-white text-base mb-1.5 line-clamp-1 font-display uppercase tracking-wider group-hover:text-brand-emerald transition-colors">
        {venue.name}
      </h3>
      <p className="text-zinc-500 text-[10px] font-mono mb-4 truncate uppercase tracking-widest">
        {venue.address}
      </p>
      <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-zinc-500 block leading-none tracking-widest uppercase">Base Rate</span>
          <p className="text-white font-bold font-mono text-xs mt-1">
            Rp {Number(venue.price_per_hour || 0).toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  </Link>
);

export default async function CustomerDashboard() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );
  
  const venues = await getFeaturedVenues(supabase).catch(() => []);

  return (
    <main className="w-full font-sans text-white">
      <HeroSection />
      
      <div className="max-w-7xl mx-auto p-6 space-y-20 my-12">
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-zinc-800 pb-4 gap-4">
            <div>
              <h2 className="text-2xl font-black text-white font-display uppercase tracking-tight">Katalog Arena</h2>
              <p className="text-zinc-500 text-xs font-mono mt-1">Fasilitas olahraga terverifikasi.</p>
            </div>
            <Link href="/venues" className="text-brand-emerald hover:text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest transition-colors">
              Lihat Semua
            </Link>
          </div>
          
          {venues.length === 0 ? (
            <div className="p-12 bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl text-center text-zinc-500 font-mono text-xs uppercase tracking-widest">
              BELUM ADA ARENA AKTIF.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {venues.map(venue => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}