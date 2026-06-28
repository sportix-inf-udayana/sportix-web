import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { AlertTriangle } from "lucide-react";

// Path relatif absolut sesuai struktur folder
import { getPendingVenues } from "../../../../lib/services/admin.service";
import SuperAdminHeader from "../../../../components/super-admin/SuperAdminHeader";
import VerificationClient from "../../../../components/super-admin/VerificationClient";

export default async function SuperAdminVerificationsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return <div className="p-8 text-red-500 font-mono text-center">Sesi Ilegal. Akses Ditolak.</div>;
  }

  // Pengambilan data via Data Layer
  const { data: pendingVenues, error: fetchErr } = await getPendingVenues(supabase);

  if (fetchErr) {
    return (
      <div className="max-w-7xl mx-auto p-6 mt-10 text-center border border-red-500/30 bg-red-500/10 rounded-xl">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-white font-mono text-sm">Gagal memuat koneksi ke database master.</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans select-none">
      <SuperAdminHeader />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white font-display">Stadium Onboarding Queue</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Data disinkronisasi langsung secara real-time dari database master PostgreSQL. Setujui atau tolak izin operasional ekosistem di bawah ini.
          </p>
        </div>

        <VerificationClient initialVenues={pendingVenues || []} />
      </div>
    </div>
  );
}