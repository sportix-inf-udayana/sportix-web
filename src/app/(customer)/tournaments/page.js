// src/app/(customer)/tournaments/page.js
import { getSupabaseAdmin } from '@/lib/supabase';
import Image from 'next/image';
import { getTournaments } from '@/lib/services/customer.service';

export const metadata = {
  title: 'Papan Turnamen - Sportix',
};

export const revalidate = 60;

export default async function TournamentsPage() {
  const supabase = getSupabaseAdmin();
  const tournaments = await getTournaments(supabase).catch(() => []);

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 w-full font-sans text-white">
      <header className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black font-display uppercase tracking-tight text-white">Papan Turnamen</h1>
        <p className="text-zinc-400 text-xs font-mono mt-1">Kompetisi, leaderboard, dan pendaftaran event regional.</p>
      </header>

      {tournaments.length === 0 ? (
        <div className="bg-zinc-900 p-8 rounded-xl border border-dashed border-zinc-800 text-center">
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">TIDAK ADA TURNAMEN AKTIF SAAT INI.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <article key={tournament.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-lg group hover:border-brand-emerald/50 transition-colors flex flex-col">
              {tournament.banner_url && (
                <div className="w-full h-48 relative bg-zinc-950">
                  <Image
                    src={tournament.banner_url}
                    alt={tournament.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold text-white font-display uppercase line-clamp-1">{tournament.title}</h2>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-widest border shrink-0 ${
                    tournament.status === 'open' 
                      ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' 
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {tournament.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-6 line-clamp-2 font-sans">{tournament.description}</p>
                
                <div className="flex justify-between items-center pt-4 border-t border-zinc-800/60 mt-auto">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">Entry Fee</span>
                    <span className="text-brand-emerald font-bold font-mono text-sm">
                      Rp {Number(tournament.registration_fee || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">Kickoff</span>
                    <span className="text-white font-bold font-mono text-xs">
                      {new Date(tournament.start_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}