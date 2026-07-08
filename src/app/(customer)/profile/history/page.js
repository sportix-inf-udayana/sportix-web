import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { Award, Ticket, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getUserTicketHistory } from "../../../../lib/services/customer.service";

const cn = (...inputs) => twMerge(clsx(inputs));
export const dynamic = 'force-dynamic';

const Barcode = ({ code }) => (
  <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-zinc-200">
    <div className="flex h-16 w-full items-stretch justify-center gap-[2px] bg-white px-2">
      <div className="w-[3px] bg-black" /><div className="w-[1px] bg-black" /><div className="w-[4px] bg-black" />
      <div className="w-[2px] bg-black" /><div className="w-[1px] bg-black" /><div className="w-[3px] bg-black" />
      <div className="w-[2px] bg-black" /><div className="w-[5px] bg-black" /><div className="w-[1px] bg-black" />
      <div className="w-[3px] bg-black" /><div className="w-[2px] bg-black" /><div className="w-[1px] bg-black" />
      <div className="w-[4px] bg-black" /><div className="w-[2px] bg-black" /><div className="w-[3px] bg-black" />
      <div className="w-[1px] bg-black" /><div className="w-[5px] bg-black" /><div className="w-[2px] bg-black" />
      <div className="w-[3px] bg-black" /><div className="w-[1px] bg-black" /><div className="w-[4px] bg-black" />
      <div className="w-[2px] bg-black" />
    </div>
    <div className="text-black text-center font-mono text-xs font-bold tracking-widest mt-2 break-all">{code}</div>
  </div>
);

export default async function ProfileHistoryPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 font-sans">
        <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <p className="text-zinc-400 font-mono text-sm">Sesi Anda telah berakhir. Silakan login kembali.</p>
          <Link href="/login" className="mt-6 inline-block bg-brand-emerald text-black px-6 py-2.5 rounded-lg font-bold font-mono text-xs">LOGIN PORTAL</Link>
        </div>
      </div>
    );
  }

  const { tickets, activeTickets } = await getUserTicketHistory(supabase, user.id);

  return (
    <div className="bg-zinc-950 text-white min-h-screen pb-16 font-sans select-none">
      <div className="border-b border-zinc-900 bg-zinc-950 py-6 px-6 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white font-display uppercase tracking-tight">Athlete Dossier</h1>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono mt-0.5">
                Kelola riwayat kompetisi dan tiket akses aktif
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex border-b border-zinc-900 gap-6 mb-8">
          <div className="pb-4 text-sm relative text-brand-emerald font-bold flex items-center">
            My Tickets
            <span className="ml-2 bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-[10px] px-2 py-0.5 rounded-full font-mono">
              {activeTickets?.length || 0} ACTIVE
            </span>
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-emerald" />
          </div>
          <Link href="/tournaments" className="pb-4 text-sm font-semibold text-zinc-500 hover:text-white transition-colors">Tournaments</Link>
          <Link href="/umkm" className="pb-4 text-sm font-semibold text-zinc-500 hover:text-white transition-colors">Consignment Shop</Link>
        </div>

        <div className="space-y-8">
          <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl flex gap-3.5 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider font-mono">
                Sistem Forfeit Otomatis (Threshold 15 Menit)
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mt-1 font-sans">
                Terlambat masuk <span className="text-amber-500 font-bold">&gt;15 menit</span> menghanguskan tiket secara sepihak, dana disita 100%, dan slot sisa dirilis otomatis ke ekosistem.
              </p>
            </div>
          </div>

          {!tickets || tickets.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
              <Ticket className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-zinc-300 font-mono uppercase tracking-wider">Buku Riwayat Kosong</h3>
              <p className="text-zinc-500 text-xs mt-2 mb-6 font-sans">Anda belum melakukan reservasi lapangan atau transaksi aktif apapun.</p>
              <Link href="/" className="bg-brand-emerald hover:bg-emerald-400 text-black font-black text-[10px] py-3 px-6 rounded-lg transition-all uppercase tracking-widest inline-block shadow-md">
                Eksplorasi Lapangan Premium
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((t) => {
                const isActive = t.status === "CONFIRMED";
                const isForfeited = t.status === "FORFEITED" || t.status === "EXPIRED_PAID";
                const isCompleted = t.status === "COMPLETED";
                const venueName = t.slots?.venues?.name || "Venue Tidak Diketahui";
                const price = t.slots?.price || 150000;

                return (
                  <div key={t.id} className={cn(
                    "bg-zinc-900 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between border",
                    isActive ? "border-brand-emerald/30" : isForfeited ? "border-red-500/30" : "border-zinc-800 opacity-75"
                  )}>
                    <div className={cn("h-1.5 w-full", isActive ? "bg-brand-emerald" : isForfeited ? "bg-red-500" : "bg-zinc-700")} />

                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-6 gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1 tracking-widest">VENUE ARENA</span>
                          <h3 className="text-lg font-bold text-white leading-tight font-display">{venueName}</h3>
                        </div>
                        <span className={cn(
                          "text-[10px] font-mono font-bold px-2 py-1 rounded uppercase tracking-wider shrink-0 border",
                          isActive ? "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20" : 
                          isForfeited ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                          "bg-zinc-950 text-zinc-500 border-zinc-800"
                        )}>
                          {t.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-y-4 gap-x-4 border-y border-zinc-800 py-5 mb-5 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase block tracking-wider mb-0.5">PLAY DATE</span>
                          <span className="text-zinc-300 font-bold">{t.booking_date}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase block tracking-wider mb-0.5">PLAY HOUR</span>
                          <span className="text-brand-emerald font-bold">{t.start_time?.substring(0,5)} WITA</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase block tracking-wider mb-0.5">RESERVATION ID</span>
                          <span className="text-zinc-300">{t.id.substring(0,8)}...</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase block tracking-wider mb-0.5">CASHLESS PAID</span>
                          <span className="text-amber-400 font-bold">Rp {price.toLocaleString('id-ID')}</span>
                        </div>
                      </div>

                      {isActive ? (
                        <div className="mt-4 space-y-3">
                          <Barcode code={t.barcode_token || t.id} />
                          <p className="text-[10px] font-mono text-center text-zinc-500 uppercase tracking-widest leading-none mt-2">
                            TAMPILKAN BARCODE KE OPERATOR VENUE
                          </p>
                        </div>
                      ) : isForfeited ? (
                        <div className="bg-red-950/20 rounded-xl p-4 text-center border border-red-500/20 flex flex-col items-center justify-center gap-2 text-red-400 font-mono text-xs">
                          <XCircle className="w-5 h-5 mb-1" />
                          <span className="font-bold tracking-wider">TIKET HANGUS DISITA</span>
                          <span className="text-[10px] text-red-500 mt-1">Terlambat check-in melebihi batas toleransi.</span>
                        </div>
                      ) : isCompleted ? (
                        <div className="bg-zinc-950 rounded-xl p-4 text-center border border-zinc-800 flex flex-col items-center justify-center gap-2 text-zinc-500 font-mono text-xs">
                          <CheckCircle className="w-5 h-5 mb-1" />
                          <span className="tracking-wider">SESI SELESAI & CHECKED-IN</span>
                        </div>
                      ) : (
                        <div className="text-center text-zinc-500 text-[10px] uppercase tracking-widest font-mono py-2">
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