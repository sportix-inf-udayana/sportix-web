import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import ScheduleMatrixClient from "../../../../components/coach/ScheduleMatrixClient";

export const dynamic = 'force-dynamic';

export default async function CoachSchedulePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== 'COACH') {
    redirect("/login");
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("id, full_name, status")
    .eq("owner_id", user.id)
    .single();

  if (!coach || coach.status !== 'APPROVED') {
    redirect("/coach/pending");
  }

  // Tarik riwayat bimbingan latihan yang diagendasikan oleh konsumen olahraga bersangkutan
  const { data: appointments } = await supabase
    .from("coach_bookings")
    .select(`
      id, booking_date, start_time, end_time, status, total_price,
      users ( full_name, email )
    `)
    .eq("coach_id", coach.id)
    .order("booking_date", { ascending: true });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-xl font-black font-display text-white uppercase tracking-tight">
          Panel Hub Instruktur
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase">
          Nama Pelatih: <span className="text-brand-emerald">{coach.full_name}</span>
        </p>
      </div>

      <ScheduleMatrixClient initialAppointments={appointments || []} />
    </div>
  );
}