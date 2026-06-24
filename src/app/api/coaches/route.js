import { getSupabase } from "@/lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) return new Response("Service Unavailable", { status: 503 });

    // Validasi Sesi (Wajib!)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const { coachId, reservationId, bookingDate, startTime: coachTime, endTime } = body;

    if (!coachId || !reservationId || !bookingDate) {
      return new Response(JSON.stringify({ success: false, message: "Missing booking payload." }), { status: 400 });
    }

    // PENCEGAHAN PRICE MANIPULATION: Tarik harga dari DB Master, bukan request body
    const { data: coachData, error: coachErr } = await supabase
      .from("coaches")
      .select("price_per_hour, status")
      .eq("id", coachId)
      .single();

    if (coachErr || !coachData || coachData.status !== 'APPROVED') {
      return new Response(JSON.stringify({ success: false, message: "Invalid or inactive coach." }), { status: 404 });
    }

    // Insert data (PostgreSQL UNIQUE constraint 'unique_coach_schedule' akan otomatis memblokir bentrokan jam)
    const { data: booking, error: insertError } = await supabase
      .from("coach_bookings")
      .insert({
        user_id: user.id,
        coach_id: coachId,
        reservation_id: reservationId, // Keterikatan RESTRICT sesuai SRS
        booking_date: bookingDate,
        start_time: coachTime,
        end_time: endTime,
        total_price: coachData.price_per_hour, // Single source of truth
        status: "CONFIRMED"
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') { // Postgres Code untuk Unique Violation
        return new Response(JSON.stringify({ success: false, message: "Coach is already booked for this schedule." }), { status: 409 });
      }
      throw insertError;
    }

    return new Response(JSON.stringify({
      success: true,
      bookingId: booking.id,
      executionMs: Date.now() - startTime
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}