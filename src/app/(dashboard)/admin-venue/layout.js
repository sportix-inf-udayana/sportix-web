// src/app/(dashboard)/admin-venue/layout.js
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminVenueHeader from "@/components/admin-venue/AdminVenueHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { APP_CONFIG, USER_ROLES } from '@/lib/constants';

export default async function AdminVenueLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user || user.user_metadata?.role !== USER_ROLES.ADMIN_VENUE) {
    redirect(APP_CONFIG.routes.auth.login);
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-white">
      <AdminVenueHeader />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
      <DashboardFooter />
    </div>
  );
}