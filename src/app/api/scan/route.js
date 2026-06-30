import { getSupabaseUser } from "../../../lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    if (!token) return new Response("Unauthorized. Missing Token.", { status: 401 });

    // FIX: Eliminasi god-mode client untuk mencegah eksploitasi bypass hak kepemilikan arena
    const supabase = getSupabaseUser(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response("Unauthorized", { status: 401 });

    const { data: adminUser } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (!adminUser || adminUser.role !== 'ADMIN_VENUE') {
      return new Response(JSON.stringify({ success: false, message: "Forbidden." }), { status: 403 });
    }

    const body = await req.json();
    const { barcodeToken } = body;

    if (!barcodeToken) {
      return new Response(JSON.stringify({ success: false, message: "Barcode token hilang." }), { status: 400 });
    }

    const { data: reservation, error: resErr } = await supabase
      .from("reservations")
      .select("id, status, booking_date, start_time, field_id, user_id, fields(venue_id)")
      .eq("barcode_token", barcodeToken)
      .single();

    if (resErr || !reservation) {
      return new Response(JSON.stringify({ success: false, message: "Tiket tidak ditemukan, kedaluwarsa, atau Anda tidak memiliki hak otorisasi data." }), { status: 404 });
    }

    if (reservation.status === 'CONFIRMED') {
      const reservationDateTimeWITA = new Date(`${reservation.booking_date}T${reservation.start_time}+08:00`); 
      const currentDateTimeWITA = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Makassar"}));
      
      const diffInMinutes = (currentDateTimeWITA - reservationDateTimeWITA) / 60000;

      if (diffInMinutes > 15) {
        await supabase.from("reservations").update({ status: "FORFEITED" }).eq("id", reservation.id);
        await supabase.from("slots").update({ status: "AVAILABLE", reservation_id: null, locked_until: null }).eq("reservation_id", reservation.id);
        
        return new Response(JSON.stringify({ 
          success: false, 
          message: "Akses Ditolak. Keterlambatan melebihi 15 menit. Dana disita dan tiket hangus." 
        }), { status: 403 });
      }
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        message: `Tiket tidak dapat di-scan. Status saat ini: ${reservation.status}` 
      }), { status: 400 });
    }

    const { error: updateErr } = await supabase
      .from("reservations")
      .update({ status: "COMPLETED", verified_by: user.id })
      .eq("id", reservation.id);

    if (updateErr) throw updateErr;

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