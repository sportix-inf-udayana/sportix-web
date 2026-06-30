import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import ScannerClient from "../../../../components/admin-venue/ScannerClient";

export const dynamic = 'force-dynamic';

export default async function AdminVenueScanPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'ADMIN_VENUE') redirect("/login");

  const { data: venue } = await supabase.from("venues").select("status").eq("owner_id", user.id).maybeSingle();

  if (!venue) redirect("/admin-venue/onboarding");
  if (venue.status === 'PENDING') redirect("/admin-venue/pending");
  if (venue.status === 'REJECTED') redirect("/admin-venue/onboarding");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex flex-col text-left">
        <h1 className="text-xl font-black font-display text-white uppercase tracking-tight">Terminal Validasi Tiket</h1>
        <p className="text-xs text-zinc-500 font-mono">Pemindaian Barcode Hak Masuk Bermain Fasilitas</p>
      </div>
      <ScannerClient />
    </div>
  );
}