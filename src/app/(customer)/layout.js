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
    // Penambahan `min-h-screen` dan `flex flex-col` memaksa Footer selalu berada di paling bawah layar
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      
      {/* 1. Navigasi Global (Atas) */}
      <CustomerHeader user={user} />
      
      {/* 2. Area Render Konten (Fleksibel mengisi ruang kosong) */}
      <main className="flex-1">
        {children}
      </main>

      {/* 3. Footer Global (Bawah) */}
      <CustomerFooter />
      
    </div>
  );
}