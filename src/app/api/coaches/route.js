import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuthAndCatch } from "../../../lib/api-wrapper";

const bookingSchema = z.object({
  coachId: z.string().uuid("ID Pelatih tidak valid"),
  reservationId: z.string().uuid("ID Reservasi tidak valid"),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM")
});

async function coachBookingHandler(req, { supabase, user }) {
  const startTimeMs = Date.now();
  const body = await req.json();
  const { coachId, reservationId, bookingDate, startTime, endTime } = bookingSchema.parse(body);

  const { data: coachData, error: coachErr } = await supabase
    .from("coaches")
    .select("price_per_hour, status")
    .eq("id", coachId)
    .single();

  if (coachErr || !coachData || coachData.status !== 'APPROVED') {
    return NextResponse.json({ success: false, message: "Pelatih tidak valid atau tidak aktif." }, { status: 404 });
  }

  const { data: booking, error: insertError } = await supabase
    .from("coach_bookings")
    .insert({
      user_id: user.id,
      coach_id: coachId,
      reservation_id: reservationId,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      total_price: coachData.price_per_hour,
      status: "CONFIRMED"
    })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === '23505') { 
      return NextResponse.json({ success: false, message: "Pelatih sudah dibooking pada jadwal ini." }, { status: 409 });
    }
    throw insertError;
  }

  return NextResponse.json({
    success: true,
    bookingId: booking.id,
    executionMs: Date.now() - startTimeMs
  });
}

export const POST = withAuthAndCatch(coachBookingHandler);