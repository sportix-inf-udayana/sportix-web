import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import SlotMatrixClient from "../../../../components/admin-venue/SlotMatrixClient";

// FIX 1: Cegah caching jadwal agar operator tidak salah melihat status ketersediaan arena
export const dynamic = 'force-dynamic';

export default async function AdminVenueSlotsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // FIX 2: Kunci akses halaman di tingkat kontainer server
  if (!user || user.user_metadata?.role !== 'ADMIN_VENUE') {
    redirect("/login");
  }

  // Dapatkan profil arena yang dikelola oleh user terkait
  const { data: venue, error: venueErr } = await supabase
    .from("venues")
    .select("id, name, status")
    .eq("owner_id", user.id)
    .single();

  // Redirect ke halaman pending apabila berkas fisik arena belum divalidasi oleh Super Admin
  if (venueErr || !venue || venue.status !== 'APPROVED') {
    redirect("/admin-venue/pending");
  }

  // Dapatkan detail data lapangan internal dari arena
  const { data: field } = await supabase
    .from("fields")
    .select("id")
    .eq("venue_id", venue.id)
    .maybeSingle();

  let initialSlots = [];
  const todayStr = new Date().toISOString().split('T')[0];

  if (field) {
    // Tarik data slot jadwal hari ini secara dinamis dari database master
    const { data: slotData } = await supabase
      .from("slots")
      .select("id, start_time, end_time, status")
      .eq("field_id", field.id)
      .eq("slot_date", todayStr)
      .order("start_time", { ascending: true });
      
    initialSlots = slotData || [];
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-xl font-black font-display text-white uppercase tracking-tight">
          Pusat Operasional Arena
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase">
          Fasilitas Aktif: <span className="text-brand-neon">{venue.name}</span>
        </p>
      </div>

      <SlotMatrixClient initialSlots={initialSlots} venueId={venue.id} />
    </div>
  );
}