// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const assertEnv = (val, name) => {
  if (!val) throw new Error(`CRITICAL: ${name} missing.`);
};

let adminInstance = null;

export const getSupabase = () => {
  assertEnv(URL, 'NEXT_PUBLIC_SUPABASE_URL');
  assertEnv(ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createBrowserClient(URL, ANON_KEY);
};

export const getSupabaseAdmin = () => {
  assertEnv(URL, 'NEXT_PUBLIC_SUPABASE_URL');
  assertEnv(SERVICE_KEY, 'SUPABASE_SERVICE_ROLE_KEY');
  
  if (!adminInstance) {
    adminInstance = createClient(URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminInstance;
};

export const getSupabaseUser = (token) => {
  assertEnv(URL, 'NEXT_PUBLIC_SUPABASE_URL');
  assertEnv(ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  if (!token) return getSupabase();
  
  return createClient(URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
};