import { getSupabase } from "../../../lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) return new Response("Service Unavailable", { status: 503 });

    // Otorisasi Mutlak: Harus login sebagai Admin Venue
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response("Unauthorized", { status: 401 });

    const { data: adminUser } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (!adminUser || adminUser.role !== 'ADMIN_VENUE') {
      return new Response(JSON.stringify({ success: false, message: "Forbidden. Hanya Admin Venue yang dapat melakukan pemindaian." }), { status: 403 });
    }

    const body = await req.json();
    const { barcodeToken } = body;

    if (!barcodeToken) {
      return new Response(JSON.stringify({ success: false, message: "Barcode token hilang." }), { status: 400 });
    }

    // Tarik data reservasi secara rinci untuk kalkulasi waktu lokal
    const { data: reservation, error: resErr } = await supabase
      .from("reservations")
      .select("id, status, booking_date, start_time, field_id, user_id, fields(venue_id)")
      .eq("barcode_token", barcodeToken)
      .single();

    if (resErr || !reservation) {
      return new Response(JSON.stringify({ success: false, message: "Tiket tidak ditemukan atau barcode tidak valid." }), { status: 404 });
    }

    // Validasi Kepemilikan Venue Mutlak
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

    // FAIL-SAFE GUARD: Penegakan Disiplin Waktu (Strict Forfeit Policy 15 Menit)
    // Jika tiket masih CONFIRMED, pastikan admin tidak men-scan tiket yang sudah telat lewat 15 menit
    if (reservation.status === 'CONFIRMED') {
      const reservationDateTimeWITA = new Date(`${reservation.booking_date}T${reservation.start_time}+08:00`); // WITA = UTC+8
      const currentDateTimeWITA = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Makassar"}));
      
      const diffInMinutes = (currentDateTimeWITA - reservationDateTimeWITA) / 60000;

      if (diffInMinutes > 15) {
        // Cronjob gagal/terlambat
        await supabase.from("reservations").update({ status: "FORFEITED" }).eq("id", reservation.id);
        await supabase.from("slots").update({ status: "AVAILABLE" }).eq("id", reservation.field_id);
        
        return new Response(JSON.stringify({ 
          success: false, 
          message: "Akses Ditolak. Keterlambatan melebihi 15 menit. Dana disita 100% dan tiket dihanguskan oleh sistem." 
        }), { status: 403 });
      }
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        message: `Tiket tidak dapat di-scan. Status saat ini: ${reservation.status}` 
      }), { status: 400 });
    }

    // Eksekusi Check-In & Penutupan Transaksi (Sesuai Flowchart Bab 2.5)
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