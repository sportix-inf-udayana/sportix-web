import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import ScannerClient from "@/components/admin-venue/ScannerClient";
import { ENTITY_STATUS } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export default async function AdminVenueScanPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  // 1. GUNAKAN getSession() ALIH-ALIH getUser()
  // Jauh lebih cepat karena membaca JWT. Middleware sudah memblokir akses ilegal.
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/login");
  }

  // 2. PROTEKSI ONBOARDING
  const { data: venue } = await supabase
    .from("venues")
    .select("status")
    .eq("owner_id", session.user.id)
    .maybeSingle();

  if (!venue) redirect("/admin-venue/onboarding");
  if (venue.status === ENTITY_STATUS.PENDING) redirect("/admin-venue/pending");

  return (
    <div className="space-y-6 w-full text-white max-w-xl mx-auto">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-black text-white font-display uppercase tracking-tight">Verifikasi Akses Karcis</h1>
        <p className="text-zinc-500 text-xs font-mono mt-1">Arahkan QR Code penyewa ke kamera untuk validasi instan.</p>
      </div>

      {/* 3. PROP PASSING: Eksekusi hasil refaktor komponen klien sebelumnya */}
      <ScannerClient accessToken={session.access_token} />
    </div>
  );
}