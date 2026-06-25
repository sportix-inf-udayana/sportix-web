import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { Award, Ticket, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

// Memaksa halaman untuk mengambil data segar, bukan cache statis
export const dynamic = 'force-dynamic';

// Komponen Barcode Murni (Tidak membutuhkan interaktivitas klien)
const Barcode = ({ code }) => {
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-zinc-200">
      <div className="flex h-16 w-full items-stretch justify-center gap-[2px] bg-white px-2">
        <div className="w-[3px] bg-black" />
        <div className="w-[1px] bg-black" />
        <div className="w-[4px] bg-black" />
        <div className="w-[2px] bg-black" />
        <div className="w-[1px] bg-black" />
        <div className="w-[3px] bg-black" />
        <div className="w-[2px] bg-black" />
        <div className="w-[5px] bg-black" />
        <div className="w-[1px] bg-black" />
        <div className="w-[3px] bg-black" />
        <div className="w-[2px] bg-black" />
        <div className="w-[1px] bg-black" />
        <div className="w-[4px] bg-black" />
        <div className="w-[2px] bg-black" />
        <div className="w-[3px] bg-black" />
        <div className="w-[1px] bg-black" />
        <div className="w-[5px] bg-black" />
        <div className="w-[2px] bg-black" />
        <div className="w-[3px] bg-black" />
        <div className="w-[1px] bg-black" />
        <div className="w-[4px] bg-black" />
        <div className="w-[2px] bg-black" />
      </div>
      <div className="text-black text-center font-mono text-xs font-bold tracking-widest mt-2 break-all">
        {code}
      </div>
    </div>
  );
};

export default async function ProfileHistoryPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  // 1. Otorisasi Pengguna Lapis Server
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-8 text-center glass-panel rounded-xl">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <p className="text-white font-mono">Sesi Anda telah berakhir. Silakan login kembali.</p>
          <Link href="/login" className="mt-4 inline-block bg-brand-neon text-black px-6 py-2 rounded-lg font-bold">Login</Link>
        </div>
      </div>
    );
  }

  // 2. Ekstraksi Data Tiket Aktual dari Tabel Reservasi (Single Source of Truth)
  const { data: tickets, error: ticketsErr } = await supabase
    .from("reservations")
    .select(`
      id, 
      status, 
      barcode_token, 
      booking_date, 
      start_time,
      slots ( price, time, venues ( name ) )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Kalkulasi statistik otonom untuk UI
  const activeTickets = tickets?.filter(t => t.status === "CONFIRMED") || [];

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans select-none">
      {/* Header Container */}
      <div className="border-b border-zinc-800 bg-surface-elevated py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-10 h-10 rounded bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-neon glow-emerald">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white font-display">Athlete Dossier</h1>
              <p className="text-zinc-500 text-xs uppercase tracking-wider font-mono">
                Kelola riwayat kompetisi dan tiket akses aktif Anda
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex border-b border-zinc-800/80 gap-6 mb-8">
          <div className="pb-4 text-sm relative text-brand-neon font-bold flex items-center">
            My Tickets
            <span className="ml-1.5 bg-brand-emerald/15 text-brand-neon text-micro px-1.5 py-0.5 rounded-full font-mono">
              {activeTickets.length} Active
            </span>
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-neon glow-emerald" />
          </div>

          <Link href="/tournaments" className="pb-4 text-sm font-semibold text-zinc-500 hover:text-zinc-300 transition-all duration-200">
            Tournaments
          </Link>

          <Link href="/umkm" className="pb-4 text-sm font-semibold text-zinc-500 hover:text-zinc-300 transition-all duration-200">
            Consignment Pro Shop
          </Link>
        </div>

        {/* Tab Content: Tickets (SSR) */}
        <div className="space-y-8">
          {/* Warning Rule Bar (Kepatuhan SRS) */}
          <div className="bg-surface-hover border-l-2 border-brand-amber p-4 rounded-r-lg flex gap-3.5 items-start">
            <AlertTriangle className="w-5 h-5 text-brand-amber shrink-0 mt-0.5 glow-amber" />
            <div>
              <h4 className="text-xs font-bold text-brand-amber uppercase tracking-wider font-mono">
                Sistem Forfeit Otomatis (Threshold 15 Menit)
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mt-0.5 font-sans">
                Terlambat masuk <span className="text-brand-amber font-bold">&gt;15 menit</span> menghanguskan tiket secara sepihak, dana disita 100%, dan slot sisa dirilis otomatis ke ekosistem. Status tiket pada laman ini diperbarui secara *real-time* oleh *Backend Autonomous Agent*.
              </p>
            </div>
          </div>

          {!tickets || tickets.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-2xl border-zinc-850">
              <Ticket className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-base font-bold text-zinc-300">Buku Riwayat Kosong</h3>
              <p className="text-zinc-500 text-xs mt-1 mb-6 font-sans">
                Anda belum melakukan reservasi lapangan atau transaksi aktif apapun.
              </p>
              <Link href="/" className="bg-brand-emerald hover:bg-brand-emerald/90 text-black font-black text-xs py-3 px-6 rounded-lg transition-all duration-200 glow-emerald uppercase tracking-wider inline-block">
                Eksplorasi Lapangan Premium
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tickets.map((t) => {
                const isActive = t.status === "CONFIRMED";
                const isForfeited = t.status === "FORFEITED" || t.status === "EXPIRED_PAID";
                const isCompleted = t.status === "COMPLETED";
                
                const venueName = t.slots?.venues?.name || "Venue Tidak Diketahui";
                const price = t.slots?.price || 150000;

                return (
                  <div
                    key={t.id}
                    className={`glass-panel rounded-2xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between ${
                      isActive ? "border-brand-emerald/40" : 
                      isForfeited ? "border-red-500/30" : "border-zinc-800 opacity-70"
                    }`}
                  >
                    {/* Top color strap */}
                    <div className={`h-1.5 ${
                      isActive ? "bg-brand-emerald glow-emerald" : 
                      isForfeited ? "bg-red-500 glow-red" : "bg-zinc-600"
                    }`} />

                    {/* Ticket content */}
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-4 gap-2">
                        <div>
                          <span className="text-micro font-mono text-zinc-500 uppercase block">VENUE ARENA</span>
                          <h3 className="text-lg font-bold text-white leading-tight mt-1">{venueName}</h3>
                        </div>
                        <span className={`text-micro font-mono font-bold px-2 py-1 rounded uppercase tracking-wider shrink-0 ${
                          isActive ? "bg-brand-emerald/15 text-brand-neon border border-brand-emerald/20" : 
                          isForfeited ? "bg-red-500/15 text-red-400 border border-red-500/20" : 
                          "bg-zinc-800 text-zinc-400"
                        }`}>
                          {t.status}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-y border-zinc-800/80 py-4 mb-4 text-xs font-mono">
                        <div>
                          <span className="text-micro text-zinc-500 uppercase block">PLAY DATE</span>
                          <span className="text-zinc-300 font-bold">{t.booking_date}</span>
                        </div>
                        <div>
                          <span className="text-micro text-zinc-500 uppercase block">PLAY HOUR SLOT</span>
                          <span className="text-brand-neon font-bold">{t.start_time?.substring(0,5)} WITA</span>
                        </div>
                        <div>
                          <span className="text-micro text-zinc-500 uppercase block">RESERVATION ID</span>
                          <span className="text-zinc-300">{t.id.substring(0,8)}...</span>
                        </div>
                        <div>
                          <span className="text-micro text-zinc-500 uppercase block">SECURE CASHLESS PAID</span>
                          <span className="text-brand-amber font-bold">IDR {price.toLocaleString('id-ID')}</span>
                        </div>
                      </div>

                      {/* Conditional Footer Status */}
                      {isActive ? (
                        <div className="mt-4 space-y-3">
                          {/* Render Barcode dengan UUID Token Absolut dari Server */}
                          <Barcode code={t.barcode_token || t.id} />
                          <p className="text-micro font-mono text-center text-zinc-500 uppercase tracking-widest leading-none mt-1">
                            TAP BARCODE UNDER SCANNER LUMINARY
                          </p>
                        </div>
                      ) : isForfeited ? (
                        <div className="bg-red-950/20 rounded p-4 text-center border border-red-500/20 flex flex-col items-center justify-center gap-2 text-red-400 font-mono text-xs">
                          <XCircle className="w-5 h-5 mb-1" />
                          <span className="font-bold">TIKET HANGUS DISITA</span>
                          <span className="text-micro text-red-500/80 mt-1">Terlambat check-in melebihi batas toleransi.</span>
                        </div>
                      ) : isCompleted ? (
                        <div className="bg-surface-elevated rounded p-4 text-center border border-zinc-800/60 flex flex-col items-center justify-center gap-2 text-zinc-500 font-mono text-xs">
                          <CheckCircle className="w-5 h-5 mb-1" />
                          <span>SESI SELESAI & CHECKED-IN</span>
                        </div>
                      ) : (
                        <div className="text-center text-zinc-500 text-micro uppercase font-mono py-2">
                          Status Tiket: {t.status}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}