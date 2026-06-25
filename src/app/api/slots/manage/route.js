import { NextResponse } from "next/server";
import { getSupabase } from "../../../../lib/supabase";

export async function PATCH(req) {
  try {
    const supabase = getSupabase();
    if (!supabase) return new NextResponse("Service Unavailable", { status: 503 });

    // 1. Verifikasi Identitas JWT
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Akses Ditolak." }, { status: 401 });
    }

    const body = await req.json();
    const { slotId, targetState, expectedCurrentState } = body;

    if (!slotId || !targetState) {
      return NextResponse.json({ success: false, message: "Payload instruksi tidak lengkap." }, { status: 400 });
    }

    // 2. Tarik Data Slot & Validasi Kepemilikan Venue Mutlak
    const { data: slotInfo, error: slotErr } = await supabase
      .from("slots")
      .select("id, status, venue_id, venues(owner_id)")
      .eq("id", slotId)
      .single();

    if (slotErr || !slotInfo) {
      return NextResponse.json({ success: false, message: "Slot fisik tidak ditemukan di database." }, { status: 404 });
    }

    if (slotInfo.venues?.owner_id !== user.id) {
      console.warn(`[RED TEAM ALERT]: Admin ${user.id} mencoba memanipulasi slot venue lain.`);
      return NextResponse.json({ success: false, message: "Forbidden. Akses properti ilegal." }, { status: 403 });
    }

    // 3. Atomicity Guard: Cegah Race Condition
    // Pastikan status di database masih sesuai dengan yang dilihat admin di layar
    if (expectedCurrentState && slotInfo.status !== expectedCurrentState) {
      return NextResponse.json({ 
        success: false, 
        message: `Konflik status. Slot telah diubah oleh agen lain menjadi ${slotInfo.status}. Harap muat ulang matriks.` 
      }, { status: 409 });
    }

    // 4. Eksekusi Perubahan Status
    const updatePayload = { status: targetState };
    
    // Jika dikunci manual oleh admin, berikan waktu lock tak terhingga sampai dirilis, 
    // atau gunakan mekanisme lock standar 15 menit jika Anda ingin SLA tetap berlaku.
    if (targetState === 'AVAILABLE') {
      updatePayload.locked_until = null;
    }

    const { error: updateErr } = await supabase
      .from("slots")
      .update(updatePayload)
      .eq("id", slotId);

    if (updateErr) throw updateErr;

    // Jika force cancel dari BOOKED ke AVAILABLE, pastikan reservasi terkait dibatalkan
    if (expectedCurrentState === 'BOOKED' && targetState === 'AVAILABLE') {
      await supabase
        .from("reservations")
        .update({ status: 'CANCELLED_BY_ADMIN' })
        .eq("field_id", slotId)
        .in("status", ["CONFIRMED", "PENDING"]);
    }

    return NextResponse.json({
      success: true,
      message: `Status slot berhasil diforsir menjadi ${targetState}.`
    });

  } catch (error) {
    console.error("Slot Management API Panic:", error);
    return NextResponse.json({ success: false, error: "Kesalahan server internal." }, { status: 500 });
  }
}