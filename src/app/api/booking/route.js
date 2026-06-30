import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Gunakan service role untuk bypass RLS saat booking
  );

  try {
    const { slotId, time, date, price } = await request.json();
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // 1. Validasi slot eksklusif (Cek status)
    const { data: slot, error: slotError } = await supabase
      .from("slots")
      .select("id, status, field_id")
      .eq("id", slotId)
      .single();

    if (slotError || slot.status !== 'AVAILABLE') {
      return NextResponse.json({ message: "Slot tidak tersedia atau sudah dipesan." }, { status: 409 });
    }

    // 2. Transaksi: Buat Reservasi & Lock Slot
    const { data: reservation, error: resError } = await supabase
      .from("reservations")
      .insert({
        user_id: user.id,
        field_id: slot.field_id,
        booking_date: date,
        start_time: time,
        end_time: time, // Sesuaikan logika durasi
        total_amount: price,
        status: "PENDING"
      })
      .select()
      .single();

    if (resError) throw resError;

    await supabase.from("slots").update({ status: 'LOCKED', reservation_id: reservation.id }).eq("id", slotId);

    // 3. Integrasi Midtrans di sini (Simulasi token)
    return NextResponse.json({ payment_token: "MOCK_TOKEN_MIDTRANS_123" });

  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}