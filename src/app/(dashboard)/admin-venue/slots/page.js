import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import SlotMatrixClient from "../../../../components/admin-venue/SlotMatrixClient";
import { USER_ROLES, ENTITY_STATUS } from "../../../../lib/constants";

export const dynamic = 'force-dynamic';

export default async function AdminVenueSlotsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.user_metadata?.role !== USER_ROLES.ADMIN_VENUE) redirect("/login");

  // PROTEKSI EKSPLISIT YANG SEBELUMNYA ANDA ABAIKAN
  const { data: venue } = await supabase.from("venues").select("status").eq("owner_id", user.id).maybeSingle();
  if (!venue) redirect("/admin-venue/onboarding");
  if (venue.status === ENTITY_STATUS.PENDING) redirect("/admin-venue/pending");

  // FIX: Mengubah 'type' menjadi 'sport_type'
  const { data: fields, error: fieldError } = await supabase
    .from("fields")
    .select("id, name, sport_type, venues!inner(id, name)")
    .order("name");

  if (fieldError) {
    return (
      <div className="bg-red-950/20 border border-red-900 text-red-400 p-4 rounded-lg font-mono text-sm">
        [DATABASE ERROR]: Kegagalan muat data inventaris multi-tenant. {fieldError.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-white">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-black text-white font-display uppercase">Matriks Operasional Slot</h1>
        <p className="text-zinc-500 text-xs font-mono mt-1">Multi-tenant isolation active. Inventaris kompetitor disembunyikan otomatis.</p>
      </div>
      <SlotMatrixClient initialFields={fields || []} />
    </div>
  );
}