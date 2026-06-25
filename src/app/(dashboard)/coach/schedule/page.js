import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { Award, Calendar, User, DollarSign, AlertCircle, CheckCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CoachSchedulePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  // 1. Verifikasi Sesi Pelatih
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return <div className="p-8 text-red-500 font-mono">Akses Ditolak.</div>;

  const { data: coachProfile } = await supabase.from("coaches").select("id").eq("user_id", user.id).single();
  if (!coachProfile) return <div className="p-8 text-red-500 font-mono">Profil Pelatih tidak valid.</div>;

  // 2. Tarik Data Saldo dan Aktivitas Ledger (Akurasi Finansial)
  const { data: balanceData } = await supabase.from("balances").select("available_balance").eq("user_id", user.id).single();
  const balance = balanceData?.available_balance || 0;

  const { data: recentActivity } = await supabase
    .from("ledger_transactions")
    .select("id, source, amount, created_at, transaction_type")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // 3. Tarik Jadwal Booking Aktual hari ini
  // Join dengan tabel users untuk mendapatkan nama murid
  const today = new Date().toISOString().split('T')[0];
  const { data: schedules } = await supabase
    .from("coach_bookings")
    .select(`
      id, booking_date, start_time, end_time, status,
      users (full_name)
    `)
    .eq("coach_id", coachProfile.id)
    .gte("booking_date", today)
    .order("booking_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(10);

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans select-none">
      {/* Top Header Container */}
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
              className="bg-brand-neon hover:bg-brand-emerald text-black font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all"
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
          {/* Schedule Matrix list (8 columns) */}
          <div className="lg:col-span-8 bg-surface border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-amber" /> ACTIVE SESSION MATRIX (LIVE DB)
            </h3>

            {schedules && schedules.length > 0 ? (
              <div className="space-y-4">
                {schedules.map((cs) => {
                  const isCompleted = cs.status === "COMPLETED";
                  return (
                    <div 
                      key={cs.id}
                      className="bg-surface-elevated border border-zinc-800/60 hover:border-zinc-700/80 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs text-brand-amber bg-brand-amber/10 border border-brand-amber/20 px-2 py-0.5 rounded">
                            {cs.booking_date} | {cs.start_time.substring(0,5)} - {cs.end_time.substring(0,5)}
                          </span>
                          <span className={`text-micro font-mono font-bold uppercase ${isCompleted ? "text-brand-emerald" : "text-brand-neon"}`}>
                            {cs.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-2">Private Training Session</h4>
                        <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                          <User className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Siswa: <strong className="text-zinc-300">{cs.users?.full_name || "Unknown"}</strong></span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-zinc-800/60 pt-3 md:pt-0">
                        {isCompleted ? (
                          <span className="text-micro font-mono text-brand-emerald flex items-center gap-1 uppercase bg-brand-emerald/10 border border-brand-emerald/30 px-3 py-1.5 rounded">
                            <CheckCircle className="w-3.5 h-3.5" /> VERIFIED
                          </span>
                        ) : (
                          <button className="bg-brand-neon hover:bg-brand-emerald text-black font-mono font-bold text-micro px-3.5 py-1.5 rounded transition-all">
                            VERIFY ATTENDANCE
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border border-zinc-800 border-dashed rounded-lg text-zinc-500 font-mono text-xs">
                Tidak ada jadwal pelatihan aktif untuk hari ini.
              </div>
            )}
          </div>

          {/* Activity Feed & Warning (4 columns) */}
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