import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import OnboardingClient from "../../../../components/admin-venue/OnboardingClient";

export const dynamic = 'force-dynamic';

export default async function CoachOnboardingPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'COACH') redirect("/login");

  const { data: coach } = await supabase.from("coaches").select("status").eq("owner_id", user.id).maybeSingle();

  if (coach?.status === 'PENDING') redirect("/coach/pending");
  if (coach?.status === 'APPROVED') redirect("/coach/schedule");

  return (
    <div className="p-6 max-w-md mx-auto space-y-6 text-white min-h-[80vh] flex flex-col justify-center font-sans">
      <div className="space-y-1.5 text-center">
        <h1 className="text-xl font-black font-display uppercase tracking-tight text-white">
          Sertifikasi Kompetensi Pelatih
        </h1>
        <p className="text-xs text-zinc-500 font-mono leading-relaxed">
          Isi Bidang Keahlian dan Berikan Nilai Tarif Kontrak Per Jam Anda untuk Membuka Sesi Bimbingan Bersama Atlet
        </p>
      </div>

      <OnboardingClient targetRole="COACH" />
    </div>
  );
}