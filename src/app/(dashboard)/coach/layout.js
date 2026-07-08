import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import CoachHeader from "../../../components/coach/CoachHeader";
import DashboardFooter from "../../../components/dashboard/DashboardFooter";

export default async function CoachLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'COACH') redirect("/login");

  const { data: coach } = await supabase
    .from("coaches")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!coach) redirect("/coach/onboarding");
  if (coach.status === "PENDING") redirect("/coach/pending");

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans text-white">
      <CoachHeader />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
      <DashboardFooter />
    </div>
  );
}