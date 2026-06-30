import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function UnifiedProfilePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role || "CUSTOMER";

  // Distribusikan penempatan halaman profil agar menyatu secara harmonis dengan layout masing-masing sub-sistem
  switch (role) {
    case "SUPER_ADMIN":
      redirect("/super-admin/audits?view=profile");
    case "ADMIN_VENUE":
      redirect("/admin-venue/reports?view=profile");
    case "COACH":
      redirect("/coach/wallet?view=profile");
    case "UMKM_SELLER":
      redirect("/seller-umkm/products?view=profile");
    default:
      redirect("/profile/history"); // Jalur riwayat transaksi pelanggan umum
  }
}