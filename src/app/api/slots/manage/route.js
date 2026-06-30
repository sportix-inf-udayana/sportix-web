import { NextResponse } from "next/server";
import { getSupabaseUser } from "../../../../lib/supabase";

export async function PATCH(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    if (!token) return NextResponse.json({ success: false, message: "Missing Token" }, { status: 401 });

    // FIX: Menggunakan RLS token admin venue untuk mengisolasi operasi modifikasi data slot
    const supabase = getSupabaseUser(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Akses Ditolak." }, { status: 401 });
    }

    const body = await req.json();
    const { slotId, targetState, expectedCurrentState } = body;

    if (!slotId || !targetState) {
      return NextResponse.json({ success: false, message: "Payload instruksi tidak lengkap." }, { status: 400 });
    }

    // Jika RLS aktif, kueri ini otomatis gagal/kosong jika admin mencoba mengambil slot milik orang lain
    const { data: slotInfo, error: slotErr } = await supabase
      .from("slots")
      .select("id, status, venue_id, reservation_id, venues(owner_id)")
      .eq("id", slotId)
      .single();

    if (slotErr || !slotInfo) {
      return NextResponse.json({ success: false, message: "Slot tidak ditemukan atau Anda tidak memiliki akses properti." }, { status: 404 });
    }

    if (expectedCurrentState && slotInfo.status !== expectedCurrentState) {
      return NextResponse.json({ 
        success: false, 
        message: `Konflik status. Slot telah diubah oleh agen lain menjadi ${slotInfo.status}.` 
      }, { status: 409 });
    }

    const updatePayload = { status: targetState };
    if (targetState === 'AVAILABLE') {
      updatePayload.locked_until = null;
      updatePayload.reservation_id = null;
    }

    const { error: updateErr } = await supabase
      .from("slots")
      .update(updatePayload)
      .eq("id", slotId);

    if (updateErr) throw updateErr;

    if (expectedCurrentState === 'BOOKED' && targetState === 'AVAILABLE' && slotInfo.reservation_id) {
      await supabase
        .from("reservations")
        .update({ status: 'CANCELLED_BY_ADMIN' })
        .eq("id", slotInfo.reservation_id)
        .in("status", ["CONFIRMED", "PENDING"]);
    }

    return NextResponse.json({
      success: true,
      message: `Status slot berhasil diubah menjadi ${targetState}.`
    });

  } catch (error) {
    console.error("Slot Management API Panic:", error);
    return NextResponse.json({ success: false, error: "Kesalahan server internal." }, { status: 500 });
  }
}