import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Database offline.");

    // 1. Otorisasi Pengguna
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new NextResponse(JSON.stringify({ success: false, message: "Akses Ditolak. Silakan login." }), { status: 401 });
    }

    const { tournamentId, teamName, players } = await req.json();

    if (!tournamentId || !teamName || !Array.isArray(players) || players.length === 0) {
      return new NextResponse(JSON.stringify({ error: "Payload registrasi turnamen tidak lengkap." }), { status: 400 });
    }

    // 2. Validasi Kuota (Race Condition Guard)
    // Ambil data turnamen beserta jumlah pendaftar yang sudah CONFIRMED/PAID
    const { data: tournament, error: tourneyErr } = await supabase
      .from('tournaments')
      .select('id, max_participants, registration_fee')
      .eq('id', tournamentId)
      .single();

    if (tourneyErr || !tournament) {
      return new NextResponse(JSON.stringify({ error: "Turnamen tidak ditemukan." }), { status: 404 });
    }

    const { count, error: countErr } = await supabase
      .from('tournament_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', tournamentId)
      .neq('status', 'CANCELLED');

    if (countErr) throw countErr;

    if (count >= tournament.max_participants) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        message: "Pendaftaran ditolak. Kuota turnamen telah penuh." 
      }), { status: 409 });
    }

    // 3. Injeksi Transaksi Registrasi
    const { data: registration, error: regErr } = await supabase
      .from('tournament_registrations')
      .insert({
        tournament_id: tournament.id,
        user_id: user.id,
        team_name: teamName.trim(),
        status: 'PENDING',
        payment_status: 'PENDING',
        payment_method: 'MIDTRANS_FULL'
      })
      .select('id')
      .single();

    if (regErr) throw regErr;

    // 4. Injeksi Roster Pemain secara Massal (Bulk Insert)
    const rosterPayload = players.map(player => ({
      registration_id: registration.id,
      player_name: player.name.trim(),
      identity_number: player.identity.trim()
    }));

    const { error: rosterErr } = await supabase
      .from('tournament_players')
      .insert(rosterPayload);

    if (rosterErr) {
      // Rollback manual jika gagal
      await supabase.from('tournament_registrations').delete().eq('id', registration.id);
      throw rosterErr;
    }

    // 5. SOLUSI KONTRADIKSI TIPE DATA UUID vs STRING PREFIX
    // Berikan Order ID khusus untuk Midtrans dengan merangkai prefix TRN- ke UUID
    const midtransOrderId = `TRN-${registration.id}`;

    return NextResponse.json({
      success: true,
      message: "Registrasi diinisialisasi. Menunggu pembayaran.",
      registrationId: registration.id, // ID murni untuk routing internal
      midtransOrderId: midtransOrderId, // ID komposit untuk payment gateway
      amount: tournament.registration_fee,
      executionMs: Date.now() - startTime
    });

  } catch (error) {
    console.error("Tournament API Error:", error);
    return new NextResponse(JSON.stringify({ success: false, error: "Kesalahan server internal." }), { status: 500 });
  }
}