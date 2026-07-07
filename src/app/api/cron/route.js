import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase";

export async function GET(request) {
  if (request.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, message: "Unauthorized. Invalid Signature." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const expirationThreshold = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  try {
    const { data: staleReservations } = await supabase
      .from("reservations")
      .select("id")
      .eq("status", "PENDING")
      .lt("created_at", expirationThreshold);

    if (staleReservations?.length > 0) {
      const staleIds = staleReservations.map(r => r.id);

      // Eksekusi paralel untuk memangkas latensi I/O database
      await Promise.all([
        supabase
          .from("slots")
          .update({ status: "AVAILABLE", reservation_id: null })
          .in("reservation_id", staleIds)
          .eq("status", "LOCKED"),
        supabase
          .from("reservations")
          .update({ status: "EXPIRED", notes: "Sistem: Dibatalkan otomatis (Timeout Gateway)" })
          .in("id", staleIds)
      ]);
        
      console.log(`[CRON] Berhasil membebaskan ${staleIds.length} slot deadlock.`);
    }

    return NextResponse.json({ success: true, message: "Penyapuan slot sukses." });
  } catch (error) {
    console.error("[CRON ERROR]:", error);
    return NextResponse.json({ success: false, message: "Kegagalan Database." }, { status: 500 });
  }
}