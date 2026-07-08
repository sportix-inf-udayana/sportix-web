import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import WithdrawalClientWrapper from "../../../../components/coach/WithdrawalClientWrapper";

export const dynamic = 'force-dynamic';

export default async function CoachWalletPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== 'COACH') redirect("/login");

  // RLS menjamin query ini hanya bisa mengakses row berelasi foreign-key user_id
  const { data: coach } = await supabase
    .from("coaches")
    .select("status")
    .eq("user_id", user.id) // Diperbaiki dari eq('id', user.id)
    .maybeSingle();

  if (!coach) redirect("/coach/onboarding");
  if (coach.status === 'PENDING') redirect("/coach/pending");
  if (coach.status === 'REJECTED') redirect("/coach/onboarding");

  const { data: balanceData } = await supabase
    .from("balances")
    .select("available_balance, pending_balance")
    .eq("user_id", user.id)
    .maybeSingle();

  const safeBalance = balanceData || { available_balance: 0, pending_balance: 0 };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-white font-sans">
      <div className="flex flex-col">
        <h1 className="text-xl font-black font-display uppercase tracking-tight">Manajemen Finansial Instruktur</h1>
        <p className="text-xs text-zinc-500 font-mono">Pencairan Honorarium Kontrak Hasil Bimbingan Latihan</p>
      </div>
      <WithdrawalClientWrapper balance={safeBalance} />
    </div>
  );
}