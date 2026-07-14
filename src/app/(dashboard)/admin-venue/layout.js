import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminVenueHeader from "@/components/admin-venue/AdminVenueHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import { APP_CONFIG } from '@/lib/constants';

export default async function AdminVenueLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // 1. Validasi Identitas Dasar
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect(APP_CONFIG.routes.auth.login);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AdminVenueHeader user={user} />
      
      <main className="flex-1 w-full">
        {children}
      </main>

      <DashboardFooter />
    </div>
  );
}