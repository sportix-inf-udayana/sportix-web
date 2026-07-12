'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { APP_CONFIG } from '@/lib/constants';

const createSupabaseServerClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch (error) {
             // Tangani error cookie jika dipanggil dari server component
          }
        },
      },
    }
  );
};

export async function loginAction(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect(APP_CONFIG.routes.protected.customer);
}

export async function logoutAction() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(APP_CONFIG.routes.auth.login);
}

export async function registerAction(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const name = formData.get('name'); // Opsional, asumsi ada input nama
  
  const supabase = createSupabaseServerClient();

  // Implementasi pembuatan user baru
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      }
    }
  });

  if (error) {
    return { error: error.message };
  }

  // Redirect ke halaman verifikasi atau login setelah sukses
  redirect(APP_CONFIG.routes.auth.login + '?registered=true');
}