import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const checkEnv = (url, key, type) => {
  if (!url || !key) {
    throw new Error(`CRITICAL: Konfigurasi Supabase ${type} tidak ditemukan.`);
  }
};

let supabaseAdminInstance = null;
let supabaseAnonInstance = null;

export function getSupabase() {
  checkEnv(URL, ANON_KEY, "URL/ANON_KEY");
  if (!supabaseAnonInstance) {
    supabaseAnonInstance = createClient(URL, ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseAnonInstance;
}

export function getSupabaseAdmin() {
  checkEnv(URL, SERVICE_KEY, "Service Role Key");
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseAdminInstance;
}

export function getSupabaseUser(token) {
  checkEnv(URL, ANON_KEY, "URL/ANON_KEY");
  if (!token) return getSupabase();
  
  return createClient(URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}