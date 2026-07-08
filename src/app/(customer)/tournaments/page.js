import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Trophy, Calendar, Users, MapPin, AlertCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function TournamentsHubPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: tournaments, error: tourneyError } = await supabase
    .from("tournaments")
    .select("*, venues(name, address)")
    .order("tournament_date", { ascending: true });

  if (tourneyError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
        <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-2xl max-w-md text-center shadow-2xl">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-white font-bold mb-2 uppercase tracking-tight">Gagal Memuat Turnamen</h2>
          <p className="text-zinc-500 text-xs font-mono">Server database menolak koneksi. Silakan coba beberapa saat lagi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-white min-h-screen pb-24 font-sans relative">
      <div className="border-b border-zinc-900 bg-zinc-950 py-6 px-6 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span className="text-lg font-black text-white font-display tracking-wide uppercase">
              Tournament Hub
            </span>
          </div>
          <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1 rounded-full font-mono font-bold tracking-widest">
            LIVE EVENTS
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 relative z-10">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white font-display mb-4 uppercase tracking-tight">
            Kompetisi Regional
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
            Sistem registrasi terpadu. Kunci slot tim Anda, bayar deposit via payment gateway, dan penuhi syarat pendaftaran secara digital tanpa dokumen fisik.
          </p>
        </div>

        {tournaments && tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((t) => {
              const formattedDate = new Date(t.tournament_date).toLocaleDateString('id-ID', {
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
              });

              return (
                <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors group relative overflow-hidden shadow-xl">
                  <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <Trophy className="w-32 h-32 text-white" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-start mb-5">
                      <span className="text-[10px] font-mono bg-zinc-950 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {t.sports_type}
                      </span>
                      <span className="text-[10px] font-mono text-brand-emerald font-bold tracking-widest">
                        {t.max_participants} SLOT MAX
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white font-display mb-3 leading-tight uppercase">
                      {t.title}
                    </h3>
                    <p className="text-zinc-500 text-xs mb-6 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>

                    <div className="space-y-4 font-mono text-[10px] text-zinc-400 mb-8 uppercase tracking-wider">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-zinc-600" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-zinc-600" />
                        <span className="truncate">{t.venues?.name || "TBA"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-zinc-600" />
                        <span className="text-amber-400 font-bold">Prize: Rp {Number(t.prize_pool).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-800 pt-5 flex items-center justify-between mt-auto">
                    <div>
                      <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-1">REG FEE</span>
                      <span className="font-bold text-white font-mono text-sm">
                        Rp {Number(t.registration_fee).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <button className="bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-lg text-[10px] font-black font-mono transition-all shadow-md uppercase tracking-widest">
                      DAFTAR TIM
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center shadow-xl">
            <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-white font-bold mb-2 font-display uppercase tracking-wider">Tidak Ada Turnamen Aktif</h3>
            <p className="text-zinc-500 text-xs font-mono max-w-sm mx-auto">
              Saat ini belum ada jadwal turnamen regional yang diselenggarakan oleh mitra venue kami.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}