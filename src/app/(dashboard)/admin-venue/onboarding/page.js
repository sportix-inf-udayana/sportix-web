import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import OnboardingClient from "../../../../components/admin-venue/OnboardingClient";

export const dynamic = 'force-dynamic';

export default async function AdminVenueOnboardingPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'ADMIN_VENUE') redirect("/login");

  const { data: existingVenue } = await supabase
    .from("venues")
    .select("status")
    .eq("owner_id", user.id)
    .maybeSingle();

  // Jika berkas sudah ada dan sedang diaudit, lempar paksa ke ruang tunggu
  if (existingVenue?.status === 'PENDING') redirect("/admin-venue/pending");
  // Jika sudah aktif, bypass langsung ke matriks slot utama
  if (existingVenue?.status === 'APPROVED') redirect("/admin-venue/slots");

  return (
    <div className="p-6 max-w-md mx-auto space-y-6 text-white min-h-[80vh] flex flex-col justify-center font-sans">
      <div className="space-y-1.5 text-center">
        <h1 className="text-xl font-black font-display uppercase tracking-tight text-white">
          Registrasi Legalitas Arena
        </h1>
        <p className="text-xs text-zinc-500 font-mono leading-relaxed">
          Unggah Identitas Lokasi Properti Fasilitas Anda untuk Membuka Hak Akses Operasional Finansial Sportix
        </p>
      </div>

      {/* Komponen formulir interaktif pengisi tabel venues */}
      <OnboardingClient targetRole="ADMIN_VENUE" />
    </div>
  );
}