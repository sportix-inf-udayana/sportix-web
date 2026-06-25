import { createClient } from "@supabase/supabase-js";

let supabaseInstance = null;

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  // STRICT FAIL-FAST: Mematikan aplikasi di tahap awal jika env hilang, mencegah kebocoran data
  if (!url || !key || url.includes("your-project") || url.includes("placeholder")) {
    throw new Error("CRITICAL ERROR: Supabase credentials (URL/KEY) are missing in environment variables. Execution halted.");
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false
      }
    });
    return supabaseInstance;
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    throw error;
  }
}