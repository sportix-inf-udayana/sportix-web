import { getSupabase } from "@/lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Fatal: Database connection unavailable." 
      }), { status: 503, headers: { "Content-Type": "application/json" } });
    }

    // 1. Ekstraksi Token dan Validasi Identitas Kriptografi Mutlak
    const authHeader = req.headers.get('Authorization');
    let token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    }

    // Gunakan getUser() yang mengeksekusi verifikasi kriptografi ke server Supabase Auth
    const { data: { user }, error: authError } = token 
      ? await supabase.auth.getUser(token) 
      : await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Laporan Ancaman: Akses ditolak. JWT hilang, kadaluarsa, atau dimanipulasi." 
      }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    // Kunci UUID aktual dari entitas pengguna yang sah
    const realUserId = user.id;

    // 2. Validasi Payload Masukan 
    const body = await req.json();
    const { slotId, time, date, price } = body;

    if (!slotId || !time || !date) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Bad Request: Parameter payload slot tidak lengkap." 
      }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const bookingPrice = Number(price) || 150000;

    // 3. Atomic Locking (Pencegahan Mutlak Race Condition & Double Booking)
    // Kalkulasi waktu kadaluwarsa mutlak: Current Time UTC + 15 Menit
    const lockExpiry = new Date(Date.now() + 15 * 60000).toISOString();

    const { data: updatedSlots, error: lockError } = await supabase
      .from("slots")
      .update({ 
        status: "LOCKED",
        locked_until: lockExpiry // BLIND SPOT PATCHED: Kunci batas waktu ini agar slot tidak mati
      })
      .eq("id", slotId)
      .eq("status", "AVAILABLE")
      .select();

    if (lockError) throw lockError;

    // Jika tidak ada baris yang ter-update, berarti ada penyerang/pengguna lain yang menang sepersekian detik
    if (!updatedSlots || updatedSlots.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: "Conflict: Slot ini telah dikunci atau dibooking oleh proses lain."
      }), { status: 409, headers: { "Content-Type": "application/json" } });
    }

    // 4. Injeksi Transaksi Reservasi
    // Biarkan database yang melakukan generate UUID murni untuk relasi Primary Key
    const { data: reservation, error: resError } = await supabase
      .from("reservations")
      .insert({
        user_id: realUserId, // Terhubung ke user nyata
        field_id: slotId, 
        booking_date: date,
        start_time: time,
        end_time: `${parseInt(time.split(":")[0]) + 1}:00`, // Hitung offset 1 jam mutlak
        total_amount: bookingPrice,
        status: "PENDING",
        payment_method: "MIDTRANS_FULL"
      })
      .select()
      .single();

    // 5. Mitigasi Kegagalan Parsial (Rollback)
    if (resError) {
      // Jika penulisan reservasi gagal (misal constraint dilanggar), lepaskan kembali gembok slot
      await supabase.from("slots").update({ status: "AVAILABLE" }).eq("id", slotId);
      throw resError;
    }

    // Eksekusi Sukses
    return new Response(JSON.stringify({
      success: true,
      message: "Slot successfully locked physically. PENDING state established.",
      reservationId: reservation.id, // ID ini akan digunakan untuk inisiasi charge Midtrans
      executionMs: Date.now() - startTime
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Critical Backend Booking Error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Terjadi kesalahan internal server.",
      error: error.message 
    }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}