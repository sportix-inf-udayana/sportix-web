import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminVenueReportsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'ADMIN_VENUE') redirect("/login");

  // Validasi status kelayakan entitas lapangan di tingkat komponen server
  const { data: venue } = await supabase.from("venues").select("status").eq("owner_id", user.id).maybeSingle();

  if (!venue) redirect("/admin-venue/onboarding");
  if (venue.status === 'PENDING') redirect("/admin-venue/pending");
  if (venue.status === 'REJECTED') redirect("/admin-venue/onboarding");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4 text-white font-sans">
      <div className="flex flex-col">
        <h1 className="text-xl font-black font-display uppercase tracking-tight">Pelaporan Rekonsiliasi Keuangan</h1>
        <p className="text-xs text-zinc-500 font-mono">Buku Besar Pendapatan Bersih Hasil Reservasi Lapangan</p>
      </div>
      <div className="h-64 border border-zinc-800 bg-zinc-900/30 rounded-xl flex items-center justify-center text-xs font-mono text-zinc-500">
        [ GRAFIK ANALITIK KAS AKTIF ]
      </div>
    </div>
  );
}