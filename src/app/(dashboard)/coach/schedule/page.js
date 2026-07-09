import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import ScheduleMatrixClient from "../../../../components/coach/ScheduleMatrixClient";
import { USER_ROLES, ENTITY_STATUS } from "../../../../lib/constants";

export const dynamic = 'force-dynamic';

export default async function CoachSchedulePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== USER_ROLES.COACH) redirect("/login");

  // PROTEKSI ONBOARDING/PENDING
  const { data: coach } = await supabase.from("coaches").select("status").eq("user_id", user.id).maybeSingle();
  if (!coach) redirect("/coach/onboarding");
  if (coach.status === ENTITY_STATUS.PENDING) redirect("/coach/pending");

  const { data: schedules, error: scheduleError } = await supabase
    .from("coach_schedules")
    .select("id, day_of_week, start_time, end_time, status, is_booked, reservations(booking_date, users(raw_user_meta_data))")
    .order("day_of_week");

  if (scheduleError) {
    return <div className="text-red-400 p-4 font-mono text-sm">[ERROR]: {scheduleError.message}</div>;
  }

  return (
    <div className="space-y-6 w-full text-white">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-black text-white font-display uppercase">Agenda Bimbingan Latihan</h1>
        <p className="text-zinc-500 text-xs font-mono mt-1">Multi-tenant isolation active.</p>
      </div>
      <ScheduleMatrixClient initialSchedules={schedules || []} />
    </div>
  );
}