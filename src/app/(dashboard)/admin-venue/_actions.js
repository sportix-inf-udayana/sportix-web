'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function submitVenueOnboardingAction(formData) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: 'Sesi tidak valid.' };
  }

  const name = formData.get('name');
  const address = formData.get('address');
  const description = formData.get('description');
  const phone = formData.get('phone');

  // Insert ke tabel venue dan set status ke 'pending'
  const { error } = await supabase
    .from('venues')
    .insert({
      owner_id: user.id,
      name,
      address,
      description,
      phone,
      status: 'pending', // Menandakan butuh approval Super Admin
      is_active: false
    });

  if (error) {
    console.error('[Onboarding Action Error]:', error.message);
    return { error: 'Gagal mengirim data pendaftaran. Silakan coba lagi.' };
  }

  // Redirect ke halaman pending
  redirect('/admin-venue/pending');
}