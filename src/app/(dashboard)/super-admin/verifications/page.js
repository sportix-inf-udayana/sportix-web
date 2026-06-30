import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import VerificationClient from "../../../../components/super-admin/VerificationClient";

// FIX 1: Matikan optimasi statis agar antrean verifikasi selalu menyajikan data riil ter-update
export const dynamic = 'force-dynamic';

export default async function SuperAdminVerificationsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // FIX 2: Penegakan Defense-in-Depth untuk mencegah akses ilegal sisi server
  if (!user || user.user_metadata?.role !== 'SUPER_ADMIN') {
    redirect("/login");
  }

  // Tarik data pendaftaran pending dari seluruh klaster kemitraan secara serentak (Parallel Fetching)
  const [venuesRes, coachesRes, storesRes] = await Promise.all([
    supabase.from("venues").select("id, name, address").eq("status", "PENDING"),
    supabase.from("coaches").select("id, full_name, specialization").eq("status", "PENDING"),
    supabase.from("umkm_stores").select("id, name, address").eq("status", "PENDING")
  ]);

  // Konsolidasikan seluruh data mentah menjadi satu array terpadu untuk dikirim ke client component
  const unifiedPendingQueue = [
    ...(venuesRes.data || []).map(v => ({ ...v, type: "VENUE" })),
    ...(coachesRes.data || []).map(c => ({ id: c.id, name: c.full_name, address: c.specialization, type: "COACH" })),
    ...(storesRes.data || []).map(s => ({ ...s, type: "UMKM_STORE" }))
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-black font-display tracking-tight text-white uppercase">
          Pusat Kendali Otoritas
        </h1>
        <p className="text-xs text-zinc-500 font-mono">
          Yurisdiksi Peninjauan Berkas Kemitraan Ekosistem Sportix Berskala Regional
        </p>
      </div>

      {/* Alirkan antrean dinamis ke komponen interaktif klien yang telah dipasang token-bound headers */}
      <VerificationClient initialItems={unifiedPendingQueue} />
    </div>
  );
}