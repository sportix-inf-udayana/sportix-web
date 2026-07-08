import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import ScannerClient from "../../../../components/admin-venue/ScannerClient";

export const dynamic = 'force-dynamic';

export default async function AdminVenueScanPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user || user.user_metadata?.role !== 'ADMIN_VENUE') {
    redirect("/login");
  }

  return (
    <div className="space-y-6 w-full text-white max-w-xl mx-auto">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-black text-white font-display uppercase tracking-tight">Verifikasi Akses Karcis</h1>
        <p className="text-zinc-500 text-xs font-mono mt-1">Arahkan QR Code penyewa ke kamera untuk validasi instan.</p>
      </div>

      <ScannerClient />
    </div>
  );
}