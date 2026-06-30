import { createClient } from "@supabase/supabase-js";

let supabaseAnonInstance = null;
let supabaseServiceInstance = null;

export function getSupabase() {
  if (supabaseAnonInstance) return supabaseAnonInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("CRITICAL: Konfigurasi Supabase URL/ANON_KEY tidak ditemukan di environment.");
  }

  supabaseAnonInstance = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseAnonInstance;
}

export function getSupabaseAdmin() {
  if (supabaseServiceInstance) return supabaseServiceInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("CRITICAL: Service Role Key tidak terdefinisi di lingkungan terisolasi server.");
  }

  supabaseServiceInstance = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseServiceInstance;
}

// FIX LAPISAN UTAMA: Menyediakan client yang terikat langsung dengan otentikasi JWT pengguna
export function getSupabaseUser(token) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("CRITICAL: Konfigurasi Supabase URL/ANON_KEY tidak ditemukan.");
  }

  if (!token) return getSupabase();

  // Menghasilkan instance unik per-request dengan menyuntikkan otentikasi Bearer ke header PostgreSQL
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}