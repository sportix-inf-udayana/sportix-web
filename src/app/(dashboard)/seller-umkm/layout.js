import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function SellerUmkmLayout({ children }) {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // VALIDASI FISIK KE DATABASE: Cegah akses jika toko belum disetujui
  const { data: store } = await supabase
    .from("umkm_stores")
    .select("status")
    .eq("owner_id", user.id)
    .single();

  if (!store) {
    redirect("/seller-umkm/onboarding");
  } else if (store.status === "PENDING") {
    redirect("/seller-umkm/pending");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}