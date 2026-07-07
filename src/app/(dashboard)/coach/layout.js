import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function CoachLayout({ children }) {
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

  // VALIDASI FISIK KE DATABASE: Cegah instruktur ilegal membuka dashboard jadwal
  const { data: coach } = await supabase
    .from("coaches")
    .select("status")
    .eq("id", user.id)
    .single();

  if (!coach) {
    redirect("/coach/onboarding");
  } else if (coach.status === "PENDING") {
    redirect("/coach/pending");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}