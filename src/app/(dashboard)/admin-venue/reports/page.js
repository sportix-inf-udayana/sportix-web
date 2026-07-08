import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import ReportSummaryCards from "../../../../components/admin-venue/ReportSummaryCards";
import TransactionTable from "../../../../components/admin-venue/TransactionTable";

export const dynamic = 'force-dynamic';

export default async function AdminVenueReportsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const { data: transactions, error: dataError } = await supabase
    .from("ledger_transactions")
    .select(`
      id,
      transaction_type,
      source,
      amount,
      created_at,
      reservations (
        booking_date,
        start_time,
        fields ( name )
      )
    `)
    .order("created_at", { ascending: false });

  if (dataError) {
    return (
      <div className="bg-red-950/20 border border-red-900 text-red-400 p-4 rounded-lg font-mono text-sm">
        [DATABASE ERROR]: Gagal memuat audit log finansial: {dataError.message}
      </div>
    );
  }

  const totalRevenue = transactions
    ?.filter(tx => tx.transaction_type === "CREDIT")
    ?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

  return (
    <div className="space-y-6 text-white font-mono">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Laporan Finansial Venue</h1>
        <p className="text-xs text-zinc-500 mt-1">Sistem perlindungan data otomatis berbasis Row Level Security (RLS) aktif.</p>
      </div>

      <ReportSummaryCards totalRevenue={totalRevenue} transactionCount={transactions?.length || 0} />
      <TransactionTable transactions={transactions} />
    </div>
  );
}