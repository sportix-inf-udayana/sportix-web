import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Trophy, Calendar, Users, MapPin, AlertCircle } from "lucide-react";

export default async function TournamentsHubPage() {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
      },
    }
  );

  // Tarik data turnamen publik beserta relasi ke nama venue (Relational Join)
  const { data: tournaments, error: tourneyError } = await supabase
    .from("tournaments")
    .select(`
      *,
      venues (name, address)
    `)
    .order("tournament_date", { ascending: true });

  if (tourneyError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl max-w-md text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-white font-bold mb-2">Gagal Memuat Turnamen</h2>
          <p className="text-zinc-400 text-sm">Server database tidak dapat dijangkau. Silakan coba beberapa saat lagi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen pb-24 font-sans relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-amber/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Statis */}
      <div className="border-b border-zinc-800 bg-surface-elevated/95 py-6 px-6 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-brand-amber" />
            <span className="text-lg font-black text-white font-display tracking-wide uppercase">
              Tournament Hub
            </span>
          </div>
          <span className="text-micro bg-brand-amber/10 border border-brand-amber/30 text-brand-amber px-3 py-1 rounded-full font-mono font-bold tracking-widest">
            LIVE EVENTS
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 relative z-10">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white font-display mb-3">
            Kompetisi Regional Bali
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
            Sistem registrasi tunggal untuk seluruh turnamen olahraga bersertifikasi. Kunci slot tim Anda, bayar deposit, dan penuhi syarat pendaftaran secara digital.
          </p>
        </div>

        {/* Render Daftar Turnamen secara Server-Side */}
        {tournaments && tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((t) => {
              // Format tanggal dengan presisi
              const dateObj = new Date(t.tournament_date);
              const formattedDate = dateObj.toLocaleDateString('id-ID', {
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
              });

              return (
                <div key={t.id} className="bg-surface-elevated border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Trophy className="w-24 h-24 text-white" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-micro font-mono bg-zinc-800 text-zinc-300 px-2 py-1 rounded uppercase">
                        {t.sports_type}
                      </span>
                      <span className="text-micro font-mono text-brand-neon font-bold">
                        {t.max_participants} SLOT MAX
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white font-display mb-2 leading-tight">
                      {t.title}
                    </h3>
                    <p className="text-zinc-400 text-xs mb-6 line-clamp-2">
                      {t.description}
                    </p>

                    <div className="space-y-3 font-mono text-xs text-zinc-300 mb-8">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-zinc-500" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-zinc-500" />
                        <span className="truncate">{t.venues?.name || "TBA"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-zinc-500" />
                        <span>Prize: Rp {Number(t.prize_pool).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-800 pt-4 flex items-center justify-between mt-auto">
                    <div>
                      <span className="block text-micro text-zinc-500 uppercase font-mono mb-0.5">Biaya Pendaftaran</span>
                      <span className="font-bold text-brand-amber font-mono">
                        Rp {Number(t.registration_fee).toLocaleString('id-ID')}
                      </span>
                    </div>
                    
                    {/* Tombol akan diarahkan ke komponen detail client untuk form pendaftaran */}
                    <button className="bg-zinc-800 hover:bg-white hover:text-black text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">
                      DAFTAR TIM
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface border border-zinc-800 rounded-2xl p-12 text-center">
            <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-white font-bold mb-2 font-display">Tidak Ada Turnamen Aktif</h3>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto">
              Saat ini belum ada jadwal turnamen regional yang diselenggarakan oleh mitra venue kami.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}