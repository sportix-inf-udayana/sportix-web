// src/app/(dashboard)/admin-venue/pending/page.js
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PendingUI from '@/components/shared/PendingUI';

export const metadata = {
  title: 'Application Pending - Sportix',
};

export default async function VenuePendingPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // GUARD LOGIC: Pastikan user benar-benar berhak melihat halaman pending ini.
  const { data: venue } = await supabase
    .from('venues')
    .select('status, is_active')
    .eq('owner_id', user.id)
    .single();

  // Jika tidak punya venue, paksa kembali ke form
  if (!venue) {
    redirect('/admin-venue/onboarding');
  }

  // Jika sudah disetujui, paksa masuk ke dashboard
  if (venue.status === 'approved' || venue.is_active) {
    redirect('/admin-venue');
  }

  // PendingUI sudah memiliki styling yang proporsional untuk dark mode
  return (
    <PendingUI 
      title="Venue Application Pending"
      message="Thank you for registering your venue. Our team is verifying your details. You will gain access to the dashboard once approved."
    />
  );
}