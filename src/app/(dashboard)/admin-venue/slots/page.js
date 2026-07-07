import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseUser } from "../../../../lib/supabase";
import SlotMatrixClient from "../../../../components/admin-venue/SlotMatrixClient";

export const dynamic = 'force-dynamic';

export default async function AdminVenueSlotsPage() {
  const cookieStore = cookies();
  
  // Ekstraksi JWT untuk ditanamkan ke dalam header kueri PostgreSQL
  const allCookies = cookieStore.getAll();
  const authCookie = allCookies.find(c => c.name.includes("auth-token"));
  const token = authCookie ? authCookie.value : "";
  
  const supabase = getSupabaseUser(token);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user || user.user_metadata?.role !== 'ADMIN_VENUE') redirect("/login");

  // RLS menjamin inner join venues hanya mengembalikan lapangan milik auth.uid()
  // Data kompetitor tidak akan bisa di-bypass meskipun parameter URL dimanipulasi
  const { data: fields, error: fieldError } = await supabase
    .from("fields")
    .select(`
      id, name, type,
      venues!inner ( id, name )
    `)
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

      {/* Mendelegasikan interaktivitas state ke Client Component murni */}
      <SlotMatrixClient initialFields={fields || []} />
    </div>
  );
}