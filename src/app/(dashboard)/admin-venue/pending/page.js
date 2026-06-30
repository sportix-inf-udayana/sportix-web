import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { ShieldAlert, Clock, LogOut } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminVenuePendingPage() {
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
  if (venue.status === 'APPROVED') redirect("/admin-venue/slots");

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-white font-sans relative">
      <div className="max-w-sm w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center shadow-2xl relative z-10">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-5">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>

        <h2 className="text-base font-bold font-mono uppercase tracking-wide text-white mb-2">
          Berkas Sedang Ditinjau
        </h2>
        <p className="text-zinc-400 text-xs leading-relaxed font-sans mb-6">
          Manifes kelayakan fisik properti arena olahraga Anda sedang divalidasi oleh Tim Super Admin Universitas Udayana. Proses ini memerlukan waktu maksimal 1x24 jam.
        </p>

        <Link href="/" className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all">
          <LogOut className="w-3.5 h-3.5" />
          <span>KELUAR PORTAL</span>
        </Link>
      </div>
    </div>
  );
}