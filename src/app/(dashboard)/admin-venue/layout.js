import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function AdminVenueLayout({ children }) {
  const cookieStore = cookies();
  
  // Inisialisasi SSR Client
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

  // VALIDASI FISIK KE DATABASE: Abaikan JWT, cek status riil saat ini
  const { data: venue } = await supabase
    .from("venues")
    .select("status")
    .eq("owner_id", user.id)
    .single();

  if (!venue) {
    redirect("/admin-venue/onboarding");
  } else if (venue.status === "PENDING") {
    redirect("/admin-venue/pending");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Asumsi komponen Sidebar/Header diletakkan di sini */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}