import { NextResponse } from "next/server";
import { getSupabaseUser } from "../../../lib/supabase";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return NextResponse.json({ message: "Unauthorized. Missing Token." }, { status: 401 });

    const supabase = getSupabaseUser(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { slotId, time, date } = await request.json();

    // STEP 1: Ambil status operasional slot terikat beserta relasi kepemilikan user reservasi aktif
    const { data: currentSlot, error: slotFetchErr } = await supabase
      .from("slots")
      .select(`
        price, field_id, status, reservation_id,
        reservations ( id, user_id, status )
      `)
      .eq("id", slotId)
      .single();

    if (slotFetchErr || !currentSlot) {
      return NextResponse.json({ message: "Slot operasional tidak ditemukan." }, { status: 404 });
    }

    const officialPrice = currentSlot.price;
    let targetReservationId = currentSlot.reservation_id;

    // STEP 2: FIX CORE LUBANG TOCTOU & DEADLOCK - Terapkan Aturan Re-entrant Lock
    const isLockedBySameUser = 
      currentSlot.status === "LOCKED" && 
      currentSlot.reservations?.user_id === user.id &&
      currentSlot.reservations?.status === "PENDING";

    if (currentSlot.status !== "AVAILABLE" && !isLockedBySameUser) {
      return NextResponse.json({ 
        success: false, 
        message: "Jadwal sewa ini baru saja dipesan atau dikunci oleh atlet lain." 
      }, { status: 409 });
    }

    if (!isLockedBySameUser) {
      // Skenario A: Slot benar-benar kosong, lakukan penguncian bersyarat eksklusif
      const { data: lockedSlot, error: lockErr } = await supabase
        .from("slots")
        .update({ status: 'LOCKED' })
        .eq("id", slotId)
        .eq("status", "AVAILABLE") 
        .select();

      if (lockErr || !lockedSlot || lockedSlot.length === 0) {
        return NextResponse.json({ 
          success: false, 
          message: "Kondisi Balapan: Jadwal sewa ini telah diambil dalam fraksi milidetik oleh user lain." 
        }, { status: 409 });
      }

      // Buat baris manifes transaksi baru
      const { data: newReservation, error: resError } = await supabase
        .from("reservations")
        .insert({
          user_id: user.id,
          field_id: currentSlot.field_id,
          booking_date: date,
          start_time: time,
          end_time: time,
          total_amount: officialPrice,
          status: "PENDING"
        })
        .select()
        .single();

      if (resError) {
        await supabase.from("slots").update({ status: 'AVAILABLE', reservation_id: null }).eq("id", slotId);
        throw resError;
      }

      targetReservationId = newReservation.id;
      await supabase.from("slots").update({ reservation_id: targetReservationId }).eq("id", slotId);
    } else {
      // Skenario B: Pemilik kunci lama masuk kembali, perbarui waktu pembuatan untuk memperpanjang masa aktif
      console.log(`[SPORTIX LOCKING]: User ${user.id} memicu re-entrant lock pada slot ${slotId}`);
      await supabase
        .from("reservations")
        .update({ created_at: new Date().toISOString() })
        .eq("id", targetReservationId);
    }

    // STEP 3: REST API Integrasi Midtrans Snap Gateway menggunakan ID Reservasi yang Valid
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
    if (!midtransServerKey) {
      return NextResponse.json({ message: "Kesalahan Konfigurasi Gateway Server." }, { status: 500 });
    }

    // Menggunakan timestamp dinamis pada order_id agar request pembaruan tidak ditolak sebagai duplicate order oleh Midtrans
    const midtransOrderId = `REV-${targetReservationId}-${Date.now()}`;
    const midtransPayload = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: Number(officialPrice)
      },
      customer_details: {
        email: user.email,
        first_name: user.user_metadata?.full_name || "Athlete Customer"
      },
      expiry: {
        start_time: new Date().toISOString().replace("T", " ").substring(0, 19) + " +0800",
        unit: "minutes",
        duration: 15
      }
    };

    const midtransResponse = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${Buffer.from(midtransServerKey + ":").toString("base64")}`
      },
      body: JSON.stringify(midtransPayload)
    });

    const midtransData = await midtransResponse.json();

    if (!midtransResponse.ok || !midtransData.token) {
      if (!isLockedBySameUser) {
        await supabase.from("slots").update({ status: 'AVAILABLE', reservation_id: null }).eq("id", slotId);
        await supabase.from("reservations").update({ status: 'FAILED_GATEWAY' }).eq("id", targetReservationId);
      }
      return NextResponse.json({ message: "Payment Gateway menolak pembuatan token transaksi." }, { status: 502 });
    }

    // Catat referensi order_id terbaru ke dalam database transaksi untuk dibaca oleh webhook callback
    await supabase.from("reservations").update({ payment_gateway_ref: midtransOrderId }).eq("id", targetReservationId);

    return NextResponse.json({ payment_token: midtransData.token });

  } catch (err) {
    console.error("Booking API Panic Handler:", err);
    return NextResponse.json({ message: "Kesalahan server internal." }, { status: 500 });
  }
}