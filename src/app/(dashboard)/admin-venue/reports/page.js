import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ReportSummaryCards from '@/components/admin-venue/ReportSummaryCards';
import TransactionTable from '@/components/admin-venue/TransactionTable';
import { APP_CONFIG } from '@/lib/constants';

export const metadata = {
  title: 'Financial Reports - Admin Venue',
};

export default async function VenueReportsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // 1. Verifikasi Autentikasi
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(APP_CONFIG.routes.auth.login);
  }

  // 2. Otorisasi & Isolasi Tenant: Ambil venue milik user ini
  const { data: venue } = await supabase
    .from('venues')
    .select('id, status, is_active')
    .eq('owner_id', user.id)
    .single();

  if (!venue || venue.status !== 'approved' || !venue.is_active) {
    // Tendang keluar jika bukan admin venue yang sah
    redirect('/admin-venue/pending');
  }

  // 3. Fetch Transaksi KHUSUS untuk venue ini
  const { data: transactions, error: txError } = await supabase
    .from('bookings')
    .select('id, booking_date, total_price, status, created_at, user_id')
    .eq('venue_id', venue.id)
    .order('created_at', { ascending: false });

  if (txError) {
    console.error('[Reports Page Error]:', txError.message);
    // Render state error yang aman
    return (
      <main className="p-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">Gagal memuat data laporan.</div>
      </main>
    );
  }

  // 4. Kalkulasi Agregasi (Poor Man's Aggregation)
  const validTransactions = transactions || [];
  
  const totalRevenue = validTransactions
    .filter(tx => tx.status === 'success' || tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.total_price, 0);

  const successfulBookings = validTransactions.filter(tx => tx.status === 'success' || tx.status === 'completed').length;
  const pendingBookings = validTransactions.filter(tx => tx.status === 'pending').length;

  const summaryData = {
    revenue: totalRevenue,
    successful: successfulBookings,
    pending: pendingBookings,
    totalTransactions: validTransactions.length
  };

  return (
    <main className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-500 mt-1">Overview of your venue's earnings and transaction history.</p>
      </div>

      {/* Komponen dumb yang hanya menerima data matang */}
      <ReportSummaryCards summary={summaryData} />
      
      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
        <TransactionTable transactions={validTransactions} />
      </section>
    </main>
  );
}