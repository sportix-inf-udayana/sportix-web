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

    // STEP 1: Ambil data tarif asli dari database master (Anti Parameter Tampering)
    const { data: currentSlot, error: slotFetchErr } = await supabase
      .from("slots")
      .select("price, field_id")
      .eq("id", slotId)
      .single();

    if (slotFetchErr || !currentSlot) {
      return NextResponse.json({ message: "Slot operasional tidak ditemukan." }, { status: 404 });
    }

    // STEP 2: FIX CORE LUBANG TOCTOU - Lakukan Penguncian Status Bersyarat secara Atomik
    // Kita paksa melakukan update status hanya JIKA status saat ini bernilai 'AVAILABLE' di level database
    const { data: lockedSlot, error: lockErr } = await supabase
      .from("slots")
      .update({ status: 'LOCKED' })
      .eq("id", slotId)
      .eq("status", "AVAILABLE") // Kunci utama penolak balapan data mikrodetik
      .select();

    // Jika baris data yang terupdate kosong (length === 0), berarti user lain telah mendahului mengunci slot ini dalam fraksi milidetik yang sama
    if (lockErr || !lockedSlot || lockedSlot.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Gagal Mengunci Slot: Lapangan ini baru saja dipesan oleh pengguna lain. Silakan pilih jam sewa yang lain." 
      }, { status: 409 });
    }

    const officialPrice = currentSlot.price;

    // STEP 3: Buat Manifes Pemesanan Resmi setelah slot berhasil dikunci secara eksklusif
    const { data: reservation, error: resError } = await supabase
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

    // Mekanisme pemulihan darurat jika penulisan manifes transaksi gagal
    if (resError) {
      await supabase.from("slots").update({ status: 'AVAILABLE' }).eq("id", slotId);
      throw resError;
    }

    // Hubungkan ID reservasi baru ke dalam jangkar baris slot yang telah aman dikunci
    await supabase.from("slots").update({ reservation_id: reservation.id }).eq("id", slotId);

    // STEP 4: REST API Integrasi Midtrans Snap Gateway
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
    if (!midtransServerKey) {
      return NextResponse.json({ message: "Kesalahan Konfigurasi Gateway Server." }, { status: 500 });
    }

    const midtransOrderId = `REV-${reservation.id}`;
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
      await supabase.from("slots").update({ status: 'AVAILABLE', reservation_id: null }).eq("id", slotId);
      await supabase.from("reservations").update({ status: 'FAILED_GATEWAY' }).eq("id", reservation.id);
      return NextResponse.json({ message: "Payment Gateway menolak pembuatan token transaksi." }, { status: 502 });
    }

    await supabase.from("reservations").update({ payment_gateway_ref: midtransOrderId }).eq("id", reservation.id);

    return NextResponse.json({ payment_token: midtransData.token });

  } catch (err) {
    console.error("Booking API Panic Handler:", err);
    return NextResponse.json({ message: "Kesalahan server internal." }, { status: 500 });
  }
}