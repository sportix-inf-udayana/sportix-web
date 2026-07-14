import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCustomerHistory } from '@/lib/services/customer.service';
import { APP_CONFIG } from '@/lib/constants';

export const metadata = {
  title: 'Booking History - Sportix',
  description: 'View your past venue bookings',
};

export default async function HistoryPage() {
  // 1. Inisialisasi Supabase khusus SSR dengan Cookies (BUKAN dari src/lib/supabase.js)
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // 2. Verifikasi Autentikasi
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect(APP_CONFIG.routes.auth.login);
  }

  // 3. Fetch Data lewat Service
  // Kita oper client supabase SSR ini ke service agar RLS database berfungsi normal
  const historyData = await getCustomerHistory(supabase, user.id);

  // 4. Render UI di Server
  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Booking History</h1>

      {historyData.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
          <p className="text-gray-500">You haven't made any bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {historyData.map((booking) => (
            <div key={booking.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {booking.venues?.name || 'Unknown Venue'}
                </h3>
                <p className="text-sm text-gray-500">
                  Date: {booking.booking_date}
                </p>
                <div className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Slots:</span> {booking.slots?.length || 0} hour(s)
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  booking.status === 'success' ? 'bg-green-100 text-green-800' : 
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {booking.status.toUpperCase()}
                </span>
                <span className="font-bold text-gray-900 mt-3 md:mt-0">
                  Rp {booking.total_price.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}