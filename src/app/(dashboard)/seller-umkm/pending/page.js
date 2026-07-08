import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import PendingUI from "../../../../components/shared/PendingUI";

export const dynamic = 'force-dynamic';

export default async function SellerUmkmPendingPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { cookies: { getAll: () => cookieStore.getAll() } });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'UMKM_SELLER') redirect("/login");

  const { data: store } = await supabase.from("umkm_stores").select("status").eq("owner_id", user.id).maybeSingle();
  if (!store) redirect("/seller-umkm/onboarding");
  if (store.status === 'APPROVED') redirect("/seller-umkm/products");

  return <PendingUI title="Toko Ditinjau" description="Pendaftaran penyedia perlengkapan olahraga Anda sedang divalidasi. Proses ini melindungi ekosistem Sportix dari entitas yang tidak sah." />;
}