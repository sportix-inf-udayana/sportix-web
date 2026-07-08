import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import PendingUI from "../../../../components/shared/PendingUI";

export const dynamic = 'force-dynamic';

export default async function CoachPendingPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { cookies: { getAll: () => cookieStore.getAll() } });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'COACH') redirect("/login");

  const { data: coach } = await supabase.from("coaches").select("status").eq("user_id", user.id).maybeSingle();
  if (!coach) redirect("/coach/onboarding");
  if (coach.status === 'APPROVED') redirect("/coach/schedule");

  return <PendingUI title="Lisensi Ditinjau" description="Berkas kepelatihan dan portofolio Anda sedang dalam tahap kurasi oleh Super Admin. Anda akan menerima akses penuh setelah disetujui." />;
}