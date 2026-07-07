import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function SuperAdminLayout({ children }) {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  
  // Validasi absolut: Tolak akses jika tidak ada user atau role diubah paksa dari sisi klien
  if (error || !user || user.user_metadata?.role !== "SUPER_ADMIN") {
    console.warn(`[SECURITY ALERT]: Percobaan akses ilegal ke kontrol pusat oleh UID: ${user?.id || 'Anonim'}`);
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}