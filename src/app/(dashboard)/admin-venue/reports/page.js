// src/app/(dashboard)/admin-venue/reports/page.js
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ReportSummaryCards from '@/components/admin-venue/ReportSummaryCards';
import TransactionTable from '@/components/admin-venue/TransactionTable';
import { APP_CONFIG, ENTITY_STATUS, BOOKING_STATUS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

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

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect(APP_CONFIG.routes.auth.login);

  const { data: venue } = await supabase
    .from('venues')
    .select('id, status, is_active')
    .eq('owner_id', user.id)
    .single();

  if (!venue || venue.status !== ENTITY_STATUS.APPROVED || !venue.is_active) {
    redirect('/admin-venue/pending');
  }

  const { data: transactions, error: txError } = await supabase
    .from('reservations')
    .select('id, booking_date, total_price, status, created_at, user_id')
    .eq('venue_id', venue.id)
    .order('created_at', { ascending: false });

  if (txError) {
    return (
      <div className="bg-red-950/20 border border-red-900 text-red-400 p-4 rounded-lg font-mono text-sm">
        [DATABASE ERROR]: Gagal memuat data laporan finansial multi-tenant.
      </div>
    );
  }

  const validTransactions = transactions || [];
  
  const totalRevenue = validTransactions
    .filter(tx => [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.COMPLETED].includes(tx.status))
    .reduce((sum, tx) => sum + Number(tx.total_price), 0);

  const successfulBookings = validTransactions.filter(tx => 
    [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.COMPLETED].includes(tx.status)
  ).length;

  const pendingBookings = validTransactions.filter(tx => tx.status === BOOKING_STATUS.PENDING).length;

  const summaryData = {
    revenue: totalRevenue,
    successful: successfulBookings,
    pending: pendingBookings,
    totalTransactions: validTransactions.length
  };

  return (
    <main className="space-y-6 w-full text-white font-sans">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-black text-white font-display uppercase tracking-tight">Laporan Finansial</h1>
        <p className="text-zinc-500 text-xs font-mono mt-1">Ikhtisar pendapatan dan rekonsiliasi transaksi fasilitas.</p>
      </div>

      <ReportSummaryCards summary={summaryData} />
      
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm">
        <h2 className="text-lg font-bold text-white mb-6 font-display uppercase tracking-wide">Transaksi Terkini</h2>
        <TransactionTable transactions={validTransactions} />
      </div>
    </main>
  );
}