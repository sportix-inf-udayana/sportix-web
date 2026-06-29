import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Calendar, Wallet } from "lucide-react";
import DashboardFooter from "../../../components/dashboard/DashboardFooter";

export const dynamic = 'force-dynamic';

export default async function CoachLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "COACH") {
    redirect("/login");
  }

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col font-sans">
      {/* Header Internal Coach */}
      <header className="w-full border-b border-zinc-800 bg-zinc-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/coach/schedule" className="font-mono font-bold tracking-wider text-brand-emerald">
              SPORTIX COACH
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-brand-slate">
              <Link href="/coach/schedule" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Calendar className="w-4 h-4" />
                <span>Atur Jadwal</span>
              </Link>
              <Link href="/coach/wallet" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Wallet className="w-4 h-4" />
                <span>Dompet Pendapatan</span>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user.user_metadata?.full_name || user.email}</p>
              <p className="text-[10px] text-brand-emerald font-mono uppercase tracking-wider">Professional Instructor</p>
            </div>
            
            <Link 
              href="/login"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold text-red-400 hover:bg-red-500/10 rounded-md transition-colors border border-red-500/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>KELUAR</span>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Konten Agenda Pelatih */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer Internal Dashboard Terpusat */}
      <DashboardFooter />
    </div>
  );
}