// src/app/(dashboard)/admin-venue/slots/page.js
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import SlotMatrixClient from "@/components/admin-venue/SlotMatrixClient";
import { ENTITY_STATUS } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export default async function AdminVenueSlotsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  // 1. FAST AUTH CHECK (Membaca JWT tanpa hit Database)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // 2. PROTEKSI ONBOARDING & TENANT DISCOVERY
  // Ambil 'id' venue sekalian untuk digunakan sebagai filter di query berikutnya
  const { data: venue } = await supabase
    .from("venues")
    .select("id, status")
    .eq("owner_id", session.user.id)
    .maybeSingle();

  if (!venue) redirect("/admin-venue/onboarding");
  if (venue.status === ENTITY_STATUS.PENDING) redirect("/admin-venue/pending");

  // 3. EXPLICIT TENANT ISOLATION (DEFENSE IN DEPTH)
  // Jangan pernah membiarkan query berjalan tanpa filter 'venue_id'
  // Kita abaikan table join yang tidak perlu jika kita sudah punya venue_id
  const { data: fields, error: fieldError } = await supabase
    .from("fields")
    .select("id, name, sport_type")
    .eq("venue_id", venue.id) // <--- KUNCI KEAMANAN MULTI-TENANT
    .order("name");

  if (fieldError) {
    return (
      <div className="bg-red-950/20 border border-red-900 text-red-400 p-4 rounded-lg font-mono text-sm">
        [DATABASE ERROR]: Kegagalan muat data inventaris multi-tenant. {fieldError.message}
      </div>
    );
  }

  // TODO: Seharusnya ada logic untuk mengambil data 'slots' berdasarkan 'fields' yang didapat
  // Misalnya: const { data: slots } = await supabase.from('slots').in('field_id', fields.map(f => f.id))

  return (
    <div className="space-y-6 w-full text-white">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-black text-white font-display uppercase">Matriks Operasional Slot</h1>
        <p className="text-zinc-500 text-xs font-mono mt-1">Multi-tenant isolation active. Inventaris kompetitor disembunyikan otomatis.</p>
      </div>
      
      {/* Jangan lupa berikan accessToken agar client component tidak perlu getSession() lagi */}
      <SlotMatrixClient 
        initialFields={fields || []} 
        accessToken={session.access_token} 
      />
    </div>
  );
}