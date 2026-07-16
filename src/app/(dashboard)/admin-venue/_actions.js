// src/app/(dashboard)/admin-venue/_actions.js
'use server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ENTITY_STATUS } from '@/lib/constants';

export async function submitVenueOnboardingAction(formData) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { error: 'Sesi tidak valid.' };

  const { error } = await supabase
    .from('venues')
    .insert({
      owner_id: user.id,
      name: formData.get('name'),
      address: formData.get('address'),
      description: formData.get('description'),
      phone: formData.get('phone'),
      status: ENTITY_STATUS.PENDING,
      is_active: false
    });

  if (error) return { error: 'Gagal mengirim data. ' + error.message };
  
  redirect('/admin-venue/pending');
}