import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) return new NextResponse("Service Unavailable", { status: 503 });

    // Validasi Sesi 
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { coachId, reservationId, bookingDate, startTime: coachTime, endTime } = body;

    if (!coachId || !reservationId || !bookingDate) {
      return NextResponse.json({ success: false, message: "Missing booking payload." }, { status: 400 });
    }

    // PENCEGAHAN PRICE MANIPULATION: Tarik harga dari DB Master
    const { data: coachData, error: coachErr } = await supabase
      .from("coaches")
      .select("price_per_hour, status")
      .eq("id", coachId)
      .single();

    if (coachErr || !coachData || coachData.status !== 'APPROVED') {
      return NextResponse.json({ success: false, message: "Invalid or inactive coach." }, { status: 404 });
    }

    // Insert data (PostgreSQL UNIQUE constraint akan otomatis memblokir bentrokan jam)
    const { data: booking, error: insertError } = await supabase
      .from("coach_bookings")
      .insert({
        user_id: user.id,
        coach_id: coachId,
        reservation_id: reservationId,
        booking_date: bookingDate,
        start_time: coachTime,
        end_time: endTime,
        total_price: coachData.price_per_hour,
        status: "CONFIRMED"
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') { 
        return NextResponse.json({ success: false, message: "Coach is already booked for this schedule." }, { status: 409 });
      }
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      executionMs: Date.now() - startTime
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}