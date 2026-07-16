// src/app/(customer)/profile/history/page.js
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCustomerHistory } from '@/lib/services/customer.service';
import { APP_CONFIG, BOOKING_STATUS } from '@/lib/constants';

export const metadata = {
  title: 'Riwayat Reservasi - Sportix',
};

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(APP_CONFIG.routes.auth.login);
  }

  const historyData = await getCustomerHistory(supabase, user.id);

  const getStatusColor = (status) => {
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
      case BOOKING_STATUS.CHECKED_IN:
      case BOOKING_STATUS.COMPLETED:
        return 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20';
      case BOOKING_STATUS.PENDING:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case BOOKING_STATUS.FORFEITED:
      case BOOKING_STATUS.EXPIRED_PAID:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default:
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 font-sans w-full flex-1 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white font-display uppercase tracking-tight">Riwayat Transaksi</h1>
        <p className="text-zinc-500 text-xs font-mono mt-1">Daftar booking arena dan pembayaran terdesentralisasi Anda.</p>
      </div>

      {historyData.length === 0 ? (
        <div className="bg-zinc-900 p-8 rounded-xl border border-dashed border-zinc-800 text-center flex-1 flex flex-col items-center justify-center min-h-[300px]">
          <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">Belum ada transaksi ditemukan.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {historyData.map((booking) => (
            <div key={booking.id} className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 shadow-lg flex flex-col md:flex-row justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                  REV-{booking.id.substring(0, 8)}
                </span>
                <h3 className="font-bold text-lg text-white font-display">
                  {booking.venues?.name || 'Fasilitas Olahraga'}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  {booking.venues?.address}
                </p>
                
                <div className="mt-4 space-y-1">
                  <div className="text-xs text-zinc-400 flex items-center gap-2">
                    <span className="font-mono text-zinc-500 w-16">TANGGAL</span> 
                    <span className="font-bold text-white">{booking.booking_date}</span>
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-2">
                    <span className="font-mono text-zinc-500 w-16">DURASI</span> 
                    <span className="font-bold text-white">{booking.venue_slots?.length || 0} Jam</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end justify-between border-t border-zinc-800 md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border tracking-widest ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                
                <div className="text-left md:text-right mt-4 md:mt-0">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Total Transaksi</span>
                  <span className="font-black text-brand-emerald text-lg font-mono">
                    Rp {Number(booking.total_price || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}