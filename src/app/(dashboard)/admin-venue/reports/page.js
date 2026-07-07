import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseUser } from "../../../../lib/supabase";
import ReportSummaryCards from "../../../../components/admin-venue/ReportSummaryCards";
import TransactionTable from "../../../../components/admin-venue/TransactionTable";

export default async function AdminVenueReportsPage() {
  const cookieStore = cookies();
  
  const allCookies = cookieStore.getAll();
  const authCookie = allCookies.find(c => c.name.includes("auth-token"));
  const token = authCookie ? authCookie.value : "";
  
  const supabase = getSupabaseUser(token);
  
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">LAPORAN FINANSIAL VENUE</h1>
        <p className="text-xs text-zinc-500 mt-1">Sistem perlindungan data otomatis berbasis Row Level Security (RLS) aktif.</p>
      </div>

      {/* Komponen Kartu Ringkasan */}
      <ReportSummaryCards 
        totalRevenue={totalRevenue} 
        transactionCount={transactions?.length || 0} 
      />

      {/* Komponen Tabel Utama */}
      <TransactionTable transactions={transactions} />
    </div>
  );
}