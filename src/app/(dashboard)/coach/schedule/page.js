import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { Award, DollarSign, AlertCircle } from "lucide-react";

// Path relatif murni sesuai instruksi
import { getCoachScheduleData } from "../../../../lib/services/coach.service";
import ScheduleMatrixClient from "../../../../components/coach/ScheduleMatrixClient";

export const dynamic = 'force-dynamic';

export default async function CoachSchedulePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return <div className="p-8 text-red-500 font-mono">Akses Ditolak.</div>;

  // Eksekusi Data Layer Terpusat
  const { coachProfile, balance, recentActivity, schedules } = await getCoachScheduleData(supabase, user.id);

  if (!coachProfile) return <div className="p-8 text-red-500 font-mono">Profil Pelatih tidak valid.</div>;

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans select-none">
      <div className="border-b border-zinc-800 bg-surface-elevated py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-micro font-mono text-zinc-500 block leading-none">TRAINER COMMAND CENTER</span>
              <h1 className="text-2xl font-black text-white font-display">Coach Command Center</h1>
            </div>
          </div>

          <div className="bg-surface border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-6 min-w-[300px]">
            <div>
              <span className="text-micro font-mono text-zinc-500 block uppercase">AVAILABLE BALANCE</span>
              <span className="text-xl font-mono font-black text-brand-neon">
                Rp {balance.toLocaleString("id-ID")}
              </span>
            </div>
            <Link 
              href="/coach/wallet"
              className="bg-brand-neon hover:bg-brand-emerald text-black font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>WITHDRAW</span>
              <DollarSign className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white font-display">Daily Training Matrix &amp; Schedule</h2>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Data jadwal disinkronisasi dari database utama. Verifikasi kehadiran murid untuk melepaskan dana (escrow) ke dompet Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Matriks Jadwal terisolasi ke Client Component */}
          <div className="lg:col-span-8">
            <ScheduleMatrixClient schedules={schedules} />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
                RECENT WALLET ACTIVITY
              </h3>
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4 font-mono text-xs">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="border-b border-zinc-800/80 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-zinc-300 font-sans text-xs">{act.source.replace(/_/g, ' ')}</span>
                        <span className={`font-bold ${act.transaction_type === "DEBIT" ? "text-red-400" : "text-brand-neon"}`}>
                          {act.transaction_type === "DEBIT" ? "-" : "+"}Rp {act.amount.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <span className="text-micro text-zinc-600 block">{new Date(act.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-zinc-500 text-xs font-mono">Buku besar kosong.</div>
              )}
            </div>

            <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-xl">
              <div className="flex gap-2 text-brand-amber mb-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <h4 className="text-xs font-bold uppercase font-mono tracking-wide leading-none">Forfeit No-Show Rules</h4>
              </div>
              <p className="text-tiny text-zinc-400 leading-relaxed">
                Jika murid Anda terlambat datang <span className="text-brand-amber font-bold">&gt;15 menit</span> tanpa konfirmasi tertulis, SLA akan mengeksekusi dana secara otomatis dan durasi slot dirilis kembali.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}