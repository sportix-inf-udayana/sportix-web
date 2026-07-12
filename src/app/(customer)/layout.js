import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import CustomerHeader from '@/components/customer/CustomerHeader';
import CustomerFooter from '@/components/customer/CustomerFooter';

export default async function CustomerLayout({ children }) {
  // Ambil sesi user di level server untuk menghindari layout flicker
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Oper data user ke Header untuk merender menu yang sesuai (misal: Avatar, Logout) */}
      <CustomerHeader user={user} />
      
      <div className="flex-grow">
        {children}
      </div>

      <CustomerFooter />
    </div>
  );
}