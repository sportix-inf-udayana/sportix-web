import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import ReportSummaryCards from "../../../../components/admin-venue/ReportSummaryCards";
import TransactionTable from "../../../../components/admin-venue/TransactionTable";
import { USER_ROLES, ENTITY_STATUS } from "../../../../lib/constants";

export const dynamic = 'force-dynamic';

export default async function AdminVenueReportsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== USER_ROLES.ADMIN_VENUE) redirect("/login");

  // PROTEKSI ONBOARDING/PENDING
  const { data: venue } = await supabase.from("venues").select("status").eq("owner_id", user.id).maybeSingle();
  if (!venue) redirect("/admin-venue/onboarding");
  if (venue.status === ENTITY_STATUS.PENDING) redirect("/admin-venue/pending");

  const { data: transactions, error: dataError } = await supabase
    .from("ledger_transactions")
    .select("id, transaction_type, source, amount, created_at, reservation_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (dataError) return <div className="text-red-400 p-4">[ERROR]: {dataError.message}</div>;

  const totalRevenue = transactions?.filter(tx => tx.transaction_type === "CREDIT")?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

  return (
    <div className="space-y-6 text-white font-mono">
      <h1 className="text-2xl font-bold uppercase">Laporan Finansial</h1>
      <ReportSummaryCards totalRevenue={totalRevenue} transactionCount={transactions?.length || 0} />
      <TransactionTable transactions={transactions} />
    </div>
  );
}