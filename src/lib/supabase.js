import { createClient } from "@supabase/supabase-js";

// Singleton instance untuk mencegah inisialisasi ganda di server-side
let supabaseInstance = null;

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Gunakan Service Role Key di server-side (opsional), Anon Key sebagai fallback
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("CRITICAL: Konfigurasi Supabase URL/KEY tidak ditemukan di environment.");
  }

  supabaseInstance = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseInstance;
}