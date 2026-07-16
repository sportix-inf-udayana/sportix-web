// src/app/(dashboard)/admin-venue/onboarding/page.js
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import OnboardingClient from '@/components/admin-venue/OnboardingClient';

export const metadata = {
  title: 'Venue Onboarding - Sportix',
};

export default async function VenueOnboardingPage() {
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

  // GUARD LOGIC: Cek status venue secara objektif. Jangan biarkan user membuat double entry.
  const { data: venue } = await supabase
    .from('venues')
    .select('status, is_active')
    .eq('owner_id', user.id)
    .single();

  if (venue) {
    if (venue.status === 'pending') redirect('/admin-venue/pending');
    if (venue.status === 'approved' || venue.is_active) redirect('/admin-venue');
  }

  // Komponen UI diletakkan langsung, Layout.js yang akan mengurus container-nya
  return <OnboardingClient />;
}