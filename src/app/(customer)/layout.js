// src/app/(customer)/layout.js
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import CustomerHeader from '@/components/customer/CustomerHeader';
import CustomerFooter from '@/components/customer/CustomerFooter';

export default async function CustomerLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white font-sans selection:bg-brand-emerald/30 selection:text-brand-emerald">
      <CustomerHeader />
      <div className="flex-grow flex flex-col">
        {children}
      </div>
      <CustomerFooter />
    </div>
  );
}