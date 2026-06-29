import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import CustomerHeader from "../../components/customer/CustomerHeader";
import CustomerFooter from "../../components/customer/CustomerFooter";

export const dynamic = 'force-dynamic';

export default async function CustomerLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  // Validasi sesi tingkat atas
  const { data: { user } } = await supabase.auth.getUser();

  return (
    // Footer dan Header global customer
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      
      {/* Navigasi Global (Atas) */}
      <CustomerHeader user={user} />
      
      {/* Area Render Konten */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer Global (Bawah) */}
      <CustomerFooter />
      
    </div>
  );
}