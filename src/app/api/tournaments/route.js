import { getSupabase } from "@/lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) return new Response("Service Unavailable", { status: 503 });

    // 1. Validasi Sesi JWT Mutlak
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const { tournamentId, teamName } = body;

    if (!tournamentId || !teamName) {
      return new Response(JSON.stringify({ success: false, message: "Missing registration payload." }), { status: 400 });
    }

    // 2. PENCEGAHAN PRICE MANIPULATION: Tarik harga resmi dari DB Master
    const { data: tournament, error: tourneyErr } = await supabase
      .from("tournaments")
      .select("registration_fee")
      .eq("id", tournamentId)
      .single();

    if (tourneyErr || !tournament) {
      return new Response(JSON.stringify({ success: false, message: "Tournament not found." }), { status: 404 });
    }

    // 3. Eksekusi Insert dengan harga yang tidak bisa dimanipulasi peretas
    const { data: registration, error: insertError } = await supabase
      .from("tournament_registrations")
      .insert({
        tournament_id: tournamentId,
        user_id: user.id,
        team_name: teamName,
        status: "PENDING",
        payment_status: "PENDING",
        payment_method: "MIDTRANS_FULL"
        // Catatan: Jika ada kolom harga di tabel ini, masukkan tournament.registration_fee, BUKAN dari req body
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({
      success: true,
      message: "Tournament registration locked. Proceed to payment.",
      registrationId: registration.id,
      amountToPay: tournament.registration_fee, // Berikan info ke klien untuk display Midtrans
      executionMs: Date.now() - startTime
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}