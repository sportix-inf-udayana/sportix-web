import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import PendingUI from "../../../../components/shared/PendingUI";

export const dynamic = 'force-dynamic';

export default async function AdminVenuePendingPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { cookies: { getAll: () => cookieStore.getAll() } });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'ADMIN_VENUE') redirect("/login");

  const { data: venue } = await supabase.from("venues").select("status").eq("owner_id", user.id).maybeSingle();
  if (!venue) redirect("/admin-venue/onboarding");
  if (venue.status === 'APPROVED') redirect("/admin-venue/slots");

  return <PendingUI title="Berkas Sedang Ditinjau" description="Manifes kelayakan fisik properti arena olahraga Anda sedang divalidasi oleh Tim Super Admin Universitas Udayana. Proses maksimal 1x24 jam." />;
}