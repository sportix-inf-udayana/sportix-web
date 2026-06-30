import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import AdminVenueHeader from "../../../components/admin-venue/AdminVenueHeader";
import DashboardFooter from "../../../components/dashboard/DashboardFooter";
import { Clock, AlertTriangle } from "lucide-react"; // FIX: Menghapus LogOut yang tidak terpakai

export const dynamic = 'force-dynamic';

export default async function AdminVenueLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  // Tarik status arena milik admin ini
  const { data: venue } = await supabase
    .from("venues")
    .select("id, name, status")
    .eq("owner_id", user.id)
    .single();

  // STATE 1: Belum punya arena sama sekali
  // Biarkan layout kosongan merender {children} (Halaman Onboarding)
  if (!venue) {
    return (
      <div className="bg-background text-foreground min-h-screen flex flex-col font-sans">
        {children}
      </div>
    );
  }

  // STATE 2: Arena terdaftar, tapi status masih PENDING_AUDIT
  if (venue.status === "PENDING") {
    return (
      <div className="bg-background text-foreground min-h-screen flex flex-col items-center justify-center p-6 font-sans relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-amber/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-md w-full bg-surface border border-brand-amber/20 rounded-xl p-8 text-center shadow-2xl relative overflow-hidden z-10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-amber animate-pulse" />
          <Clock className="w-16 h-16 text-brand-amber mx-auto mb-6 opacity-80" />
          <h2 className="text-xl font-black text-white font-display mb-2">Verifikasi Diproses</h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            Entitas arena <strong className="text-white">{venue.name}</strong> sedang dalam antrean audit kepatuhan oleh Super Admin. Akses sistem ditangguhkan hingga disetujui.
          </p>
          <div className="text-micro font-mono bg-brand-amber/10 text-brand-amber px-4 py-2 rounded border border-brand-amber/20 inline-flex items-center gap-2 uppercase tracking-widest">
            <AlertTriangle className="w-4 h-4" /> STATUS: PENDING_AUDIT
          </div>
        </div>
      </div>
    );
  }

  // STATE 3: APPROVED (Akses Penuh Diberikan)
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col font-sans relative">
      <AdminVenueHeader venueName={venue.name} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {children}
      </main>

      <DashboardFooter />
    </div>
  );
}