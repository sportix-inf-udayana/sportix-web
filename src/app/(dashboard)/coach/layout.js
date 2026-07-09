import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import CoachHeader from "../../../components/coach/CoachHeader";
import DashboardFooter from "../../../components/dashboard/DashboardFooter";
import { USER_ROLES } from "../../../lib/constants";

export default async function CoachLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== USER_ROLES.COACH) redirect("/login");

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