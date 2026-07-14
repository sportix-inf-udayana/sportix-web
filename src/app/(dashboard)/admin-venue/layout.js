import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminVenueHeader from "@/components/admin-venue/AdminVenueHeader";
import { APP_CONFIG } from '@/lib/constants';

export default async function AdminVenueLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  // Guard clause
  if (!user || user.user_metadata?.role !== 'ADMIN_VENUE') {
    redirect(APP_CONFIG.routes.auth.login);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminVenueHeader user={user} venueName="Venue Command Center" />
      <main className="p-6">{children}</main>
    </div>
  );
}