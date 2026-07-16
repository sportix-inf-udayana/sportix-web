// src/app/(dashboard)/coach/schedule/page.js
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import ScheduleMatrixClient from "@/components/coach/ScheduleMatrixClient";
import { USER_ROLES, ENTITY_STATUS, APP_CONFIG } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Jadwal Instruktur - Sportix'
};

export default async function CoachSchedulePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== USER_ROLES.COACH) {
    redirect(APP_CONFIG.routes.auth.login);
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!coach) redirect("/coach/onboarding");
  if (coach.status === ENTITY_STATUS.PENDING) redirect("/coach/pending");
  if (coach.status === ENTITY_STATUS.REJECTED) redirect("/coach/onboarding");

  const { data: schedules, error: scheduleError } = await supabase
    .from("coach_bookings")
    .select("id, booking_date, start_time, end_time, status, total_price, reservations(profiles(full_name))")
    .eq("coach_id", coach.id)
    .order("booking_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (scheduleError) {
    return (
      <div className="text-red-400 p-4 font-mono text-sm bg-red-950/20 border border-red-900 rounded-lg">
        [DATABASE_ERROR]: {scheduleError.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-white">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-black text-white font-display uppercase tracking-tight">Agenda Bimbingan Latihan</h1>
        <p className="text-zinc-500 text-xs font-mono mt-1">Multi-tenant isolation active. Client-coach matrix mapping.</p>
      </div>
      <ScheduleMatrixClient initialSchedules={schedules || []} />
    </div>
  );
}