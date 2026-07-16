// src/app/(dashboard)/coach/pending/page.js
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import PendingUI from "@/components/shared/PendingUI";
import { USER_ROLES, ENTITY_STATUS, APP_CONFIG } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export default async function CoachPendingPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user || user.user_metadata?.role !== USER_ROLES.COACH) {
    redirect(APP_CONFIG.routes.auth.login);
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!coach || coach.status === ENTITY_STATUS.REJECTED) redirect("/coach/onboarding");
  if (coach.status === ENTITY_STATUS.APPROVED) redirect("/coach/schedule");

  return (
    <PendingUI 
      title="Lisensi Ditinjau" 
      description="Berkas kepelatihan dan portofolio Anda sedang dalam tahap kurasi oleh Super Admin. Anda akan menerima akses penuh setelah disetujui." 
    />
  );
}