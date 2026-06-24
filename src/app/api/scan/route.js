import { getSupabase } from "@/lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) return new Response("Service Unavailable", { status: 503 });

    // 1. Otorisasi Mutlak: Harus login sebagai Admin Venue
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response("Unauthorized", { status: 401 });

    const { data: adminUser } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (!adminUser || adminUser.role !== 'ADMIN_VENUE') {
      return new Response(JSON.stringify({ success: false, message: "Forbidden. Hanya Admin Venue yang dapat melakukan pemindaian." }), { status: 403 });
    }

    const body = await req.json();
    const { barcodeToken } = body; // UUID E-Ticket dari QR Code

    if (!barcodeToken) {
      return new Response(JSON.stringify({ success: false, message: "Barcode token hilang." }), { status: 400 });
    }

    // 2. Tarik data reservasi berdasarkan Barcode Token
    const { data: reservation, error: resErr } = await supabase
      .from("reservations")
      .select("id, status, field_id, fields(venue_id)")
      .eq("barcode_token", barcodeToken)
      .single();

    if (resErr || !reservation) {
      return new Response(JSON.stringify({ success: false, message: "Tiket tidak ditemukan atau barcode tidak valid." }), { status: 404 });
    }

    // 3. Validasi Kepemilikan Venue (Cegah Admin Venue A nge-scan tiket Venue B)
    const venueId = reservation.fields?.venue_id;
    const { data: venueOwnership } = await supabase
      .from("venues")
      .select("id")
      .eq("id", venueId)
      .eq("owner_id", user.id)
      .single();

    if (!venueOwnership) {
      return new Response(JSON.stringify({ success: false, message: "Akses ditolak. Tiket ini bukan untuk Venue Anda." }), { status: 403 });
    }

    // 4. Validasi Status Transaksi
    if (reservation.status !== 'CONFIRMED') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: `Tiket tidak dapat di-scan. Status saat ini: ${reservation.status}` 
      }), { status: 400 });
    }

    // 5. Eksekusi Check-In & Penutupan Transaksi (Sesuai Flowchart Bab 2.5)
    await supabase.from("reservations").update({ 
      status: "COMPLETED", 
      verified_by: user.id 
    }).eq("id", reservation.id);

    return new Response(JSON.stringify({
      success: true,
      message: "Check-In Berhasil. Transaksi Selesai.",
      reservationId: reservation.id,
      executionMs: Date.now() - startTime
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}