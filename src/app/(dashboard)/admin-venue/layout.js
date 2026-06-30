import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import AdminVenueHeader from "../../../components/admin-venue/AdminVenueHeader";
import DashboardFooter from "../../../components/dashboard/DashboardFooter";
import { Clock, AlertTriangle, LogOut } from "lucide-react"; // Tambahkan LogOut

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

  // === 1. SERVER ACTION UNTUK LOGOUT ===
  const handleLogout = async () => {
    "use server";
    const cookieStore = cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );
    await supabaseAuth.auth.signOut();
    redirect("/login");
  };

  // === 2. KOMPONEN HEADER MINIMALIS ===
  // Digunakan untuk state di mana AdminVenueHeader utama belum boleh diakses
  const MinimalHeader = () => (
    <header className="w-full p-6 flex justify-end absolute top-0 left-0 right-0 z-50">
      <form action={handleLogout}>
        <button 
          type="submit" 
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors bg-surface/50 px-4 py-2 rounded-md border border-white/5 backdrop-blur-sm"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </form>
    </header>
  );

  // STATE 1: Belum punya arena sama sekali
  if (!venue) {
    return (
      <div className="bg-background text-foreground min-h-screen flex flex-col font-sans relative">
        <MinimalHeader />
        {children}
      </div>
    );
  }

  // STATE 2: Arena terdaftar, tapi status masih PENDING
  if (venue.status === "PENDING") {
    return (
      <div className="bg-background text-foreground min-h-screen flex flex-col items-center justify-center p-6 font-sans relative">
        <MinimalHeader />
        
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

  // STATE 3: VERIFIED (Akses Penuh Diberikan)
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