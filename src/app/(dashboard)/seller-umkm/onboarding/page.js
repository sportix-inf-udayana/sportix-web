import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import OnboardingClient from "../../../../components/admin-venue/OnboardingClient";

export const dynamic = 'force-dynamic';

export default async function SellerUmkmOnboardingPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'UMKM_SELLER') redirect("/login");

  const { data: store } = await supabase.from("umkm_stores").select("status").eq("owner_id", user.id).maybeSingle();

  if (store?.status === 'PENDING') redirect("/seller-umkm/pending");
  if (store?.status === 'APPROVED') redirect("/seller-umkm/products");

  return (
    <div className="p-6 max-w-md mx-auto space-y-6 text-white min-h-[80vh] flex flex-col justify-center font-sans">
      <div className="space-y-1.5 text-center">
        <h1 className="text-xl font-black font-display uppercase tracking-tight text-white">
          Manifes Toko Konsinyasi
        </h1>
        <p className="text-xs text-zinc-500 font-mono leading-relaxed">
          Daftarkan Nama Entitas Niaga UMKM Anda untuk Mulai Memasarkan Suku Cadang dan Aksesoris Olahraga Berdaulat
        </p>
      </div>

      <OnboardingClient targetRole="UMKM_SELLER" />
    </div>
  );
}