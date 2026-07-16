// src/app/(dashboard)/admin-venue/scan/page.js
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ScannerClient from '@/components/admin-venue/ScannerClient';
import { ENTITY_STATUS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

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

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) redirect('/login');

  const { data: venue } = await supabase
    .from('venues')
    .select('id, status, is_active')
    .eq('owner_id', session.user.id)
    .single();

  if (!venue || venue.status !== ENTITY_STATUS.APPROVED || !venue.is_active) {
    redirect('/admin-venue/pending');
  }

  return (
    <main className="space-y-6 w-full text-white font-sans">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-black text-white font-display uppercase tracking-tight">Kamera Verifikasi Karcis</h1>
        <p className="text-zinc-500 text-xs font-mono mt-1">Pindai token QR Kustomer untuk konfirmasi kehadiran secara otonom.</p>
      </div>
      <ScannerClient accessToken={session.access_token} />
    </main>
  );
}