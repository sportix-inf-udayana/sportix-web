// src/app/(auth)/_actions.js
'use server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { APP_CONFIG, USER_ROLES } from '@/lib/constants';

const getClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (setCookies) => {
          try {
            setCookies.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch (err) {}
        },
      },
    }
  );
};

export async function loginAction(formData) {
  const { error } = await getClient().auth.signInWithPassword({
    email: formData.get('email'),
    password: formData.get('password')
  });
  
  if (error) return { error: error.message };
  redirect(APP_CONFIG.routes.protected.customer);
}

export async function logoutAction() {
  await getClient().auth.signOut();
  redirect(APP_CONFIG.routes.auth.login);
}

export async function registerAction(formData) {
  const { error } = await getClient().auth.signUp({
    email: formData.get('email'),
    password: formData.get('password'),
    options: { 
      data: { 
        full_name: formData.get('name') || 'User',
        role: USER_ROLES.CUSTOMER
      } 
    }
  });
  
  if (error) return { error: error.message };
  redirect(`${APP_CONFIG.routes.auth.login}?registered=true`);
}