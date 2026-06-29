import { getSupabase } from "@/lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return new Response(JSON.stringify({ success: false, message: "Fatal: Database connection unavailable." }), { status: 503 });
    }

    const authHeader = req.headers.get('Authorization');
    let token;
    if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, message: "Akses ditolak. JWT hilang atau dimanipulasi." }), { status: 401 });
    }

    const body = await req.json();
    const { slotId, time, date, price } = body;

    if (!slotId || !time || !date) {
      return new Response(JSON.stringify({ success: false, message: "Parameter payload tidak lengkap." }), { status: 400 });
    }

    const bookingPrice = Number(price);
    const lockExpiry = new Date(Date.now() + 15 * 60000).toISOString();

    // 1. Kunci Secara Fisik (Atomic Lock)
    const { data: updatedSlots, error: lockError } = await supabase
      .from("slots")
      .update({ status: "LOCKED", locked_until: lockExpiry })
      .eq("id", slotId)
      .eq("status", "AVAILABLE")
      .select();

    if (lockError || !updatedSlots || updatedSlots.length === 0) {
      return new Response(JSON.stringify({ success: false, message: "Conflict: Slot telah dikunci proses lain." }), { status: 409 });
    }

    // 2. Injeksi Transaksi PENDING ke Database
    const { data: reservation, error: resError } = await supabase
      .from("reservations")
      .insert({
        user_id: user.id,
        field_id: slotId, 
        booking_date: date,
        start_time: time,
        end_time: `${parseInt(time.split(":")[0]) + 1}:00`, 
        total_amount: bookingPrice,
        status: "PENDING",
        payment_method: "MIDTRANS_FULL"
      })
      .select()
      .single();

    if (resError) {
      await supabase.from("slots").update({ status: "AVAILABLE" }).eq("id", slotId);
      throw resError;
    }

    // 3. NEGOSIASI TOKEN MIDTRANS SISI SERVER (Server-to-Server)
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
    if (!midtransServerKey) throw new Error("Kunci server Midtrans tidak ditemukan di environment.");
    
    // Otentikasi Basic Base64 (Standar Midtrans)
    const authString = Buffer.from(`${midtransServerKey}:`).toString('base64');

    const midtransResponse = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: reservation.id, // ID Reservasi Supabase menjadi acuan tunggal Midtrans
          gross_amount: bookingPrice
        },
        customer_details: {
          email: user.email,
          first_name: user.user_metadata?.full_name || "Pelanggan",
        }
      })
    });

    const snapData = await midtransResponse.json();

    if (!midtransResponse.ok) {
      // Jika Midtrans menolak, lepaskan kembali gembok database
      await supabase.from("slots").update({ status: "AVAILABLE" }).eq("id", slotId);
      await supabase.from("reservations").delete().eq("id", reservation.id);
      throw new Error(`Midtrans API Error: ${snapData.error_messages?.[0] || 'Unknown Error'}`);
    }

    // 4. Update Slot dengan Reservation ID untuk melacak kepemilikan
    await supabase.from("slots").update({ reservation_id: reservation.id }).eq("id", slotId);

    // Pengembalian Sukses beserta Token Snap
    return new Response(JSON.stringify({
      success: true,
      reservationId: reservation.id,
      payment_token: snapData.token, // INI YANG DIBUTUHKAN FRONTEND
      executionMs: Date.now() - startTime
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Critical Backend Error:", error);
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}