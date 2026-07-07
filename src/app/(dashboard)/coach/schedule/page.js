import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseUser } from "../../../../lib/supabase";
import ScheduleMatrixClient from "../../../../components/coach/ScheduleMatrixClient";

export const dynamic = 'force-dynamic';

export default async function CoachSchedulePage() {
  const cookieStore = cookies();
  
  const allCookies = cookieStore.getAll();
  const authCookie = allCookies.find(c => c.name.includes("auth-token"));
  const token = authCookie ? authCookie.value : "";
  
  const supabase = getSupabaseUser(token);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || user.user_metadata?.role !== 'COACH') redirect("/login");

  // RLS memastikan instruktur tidak bisa mengintip jadwal/klien milik kompetitor
  const { data: schedules, error: scheduleError } = await supabase
    .from("coach_schedules")
    .select(`
      id, day_of_week, start_time, end_time, status, is_booked,
      reservations ( booking_date, users ( raw_user_meta_data ) )
    `)
    .order("day_of_week");

  if (scheduleError) {
    return (
      <div className="bg-red-950/20 border border-red-900 text-red-400 p-4 rounded-lg font-mono text-sm">
        [SECURITY ALERT]: Akses ditolak oleh RLS Database. {scheduleError.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-white">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-black text-white font-display uppercase">Agenda Bimbingan Latihan</h1>
        <p className="text-zinc-500 text-xs font-mono mt-1">Multi-tenant isolation active. Data klien dienkripsi.</p>
      </div>

      <ScheduleMatrixClient initialSchedules={schedules || []} />
    </div>
  );
}