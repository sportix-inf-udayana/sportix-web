import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseUser } from "../../../../lib/supabase";
import WithdrawalClientWrapper from "../../../../components/coach/WithdrawalClientWrapper";

export const dynamic = 'force-dynamic';

export default async function CoachWalletPage() {
  const cookieStore = cookies();
  
  // Ekstraksi token untuk penegakan RLS PostgreSQL
  const allCookies = cookieStore.getAll();
  const authCookie = allCookies.find(c => c.name.includes("auth-token"));
  const token = authCookie ? authCookie.value : "";
  
  const supabase = getSupabaseUser(token);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== 'COACH') redirect("/login");

  // RLS menjamin query ini hanya bisa mengakses row milik user.id
  const { data: coach } = await supabase
    .from("coaches")
    .select("status")
    .eq("id", user.id) // Konsistensi PK coach
    .maybeSingle();

  if (!coach) redirect("/coach/onboarding");
  if (coach.status === 'PENDING') redirect("/coach/pending");
  if (coach.status === 'REJECTED') redirect("/coach/onboarding");

  // Kueri saldo terenkapsulasi RLS
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