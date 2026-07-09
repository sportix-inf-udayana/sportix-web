import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import WithdrawalClientWrapper from "../../../../components/coach/WithdrawalClientWrapper";
import { USER_ROLES, ENTITY_STATUS } from "../../../../lib/constants";

export const dynamic = 'force-dynamic';

export default async function CoachWalletPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  // Gunakan USER_ROLES.COACH dari constants
  if (authError || !user || user.user_metadata?.role !== USER_ROLES.COACH) {
    redirect("/login");
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  // Gunakan ENTITY_STATUS dari constants
  if (!coach) redirect("/coach/onboarding");
  if (coach.status === ENTITY_STATUS.PENDING) redirect("/coach/pending");
  if (coach.status === ENTITY_STATUS.REJECTED) redirect("/coach/onboarding");

  const { data: balanceData } = await supabase
    .from("balances")
    .select("amount") // Sesuaikan dengan kolom di skema SQL DDL Anda: 'amount'
    .eq("user_id", user.id)
    .maybeSingle();

  // Pastikan key object sesuai dengan komponen WithdrawalClientWrapper
  const safeBalance = balanceData || { amount: 0 };

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