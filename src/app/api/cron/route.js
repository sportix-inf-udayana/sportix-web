import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase";

export async function GET(request) {
  // Verifikasi Secret Code dari Vercel Cron
  const cronSecret = request.headers.get("x-cron-secret");
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Invalid Signature." },
      { status: 401 }
    );
  }

  // Gunakan Service Role (Bypass RLS untuk penyapuan global)
  const supabase = getSupabaseAdmin();
  
  // Batas toleransi deadlock: 5 Menit
  const expirationThreshold = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  try {
    // 1. Ambil ID reservasi PENDING yang sudah kadaluarsa
    const { data: staleReservations } = await supabase
      .from("reservations")
      .select("id")
      .eq("status", "PENDING")
      .lt("created_at", expirationThreshold);

    if (staleReservations && staleReservations.length > 0) {
      const staleIds = staleReservations.map(r => r.id);

      // 2. Bebaskan slot lapangan secara paksa
      await supabase
        .from("slots")
        .update({ status: "AVAILABLE", reservation_id: null })
        .in("reservation_id", staleIds)
        .eq("status", "LOCKED");

      // 3. Batalkan status tiket reservasi
      await supabase
        .from("reservations")
        .update({ status: "EXPIRED", notes: "Sistem: Dibatalkan otomatis (Timeout Gateway)" })
        .in("id", staleIds);
        
      console.log(`[CRON] Berhasil membebaskan ${staleIds.length} slot deadlock.`);
    }

    return NextResponse.json({ success: true, message: "Penyapuan slot sukses." });
  } catch (error) {
    console.error("[CRON ERROR]:", error);
    return NextResponse.json({ success: false, message: "Kegagalan Database." }, { status: 500 });
  }
}