import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ScannerClient from '@/components/admin-venue/ScannerClient';

export const metadata = {
  title: 'Scan Tickets - Admin Venue',
};

export default async function ScanPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // GUARD: Otorisasi Ketat Tenant
  const { data: venue } = await supabase
    .from('venues')
    .select('id, status, is_active')
    .eq('owner_id', user.id)
    .single();

  if (!venue || venue.status !== 'approved' || !venue.is_active) {
    redirect('/admin-venue/pending');
  }

  return (
    <main className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Ticket Scanner</h1>
        <p className="text-gray-500 mt-1">Scan customer QR codes to verify bookings.</p>
      </header>

      {/* Melempar venueId agar action di server tahu tiket ini discan untuk venue mana */}
      <ScannerClient venueId={venue.id} />
    </main>
  );
}