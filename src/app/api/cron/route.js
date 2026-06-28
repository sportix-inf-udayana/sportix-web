import { getSupabase } from "../../../lib/supabase";
import { NextResponse } from "next/server";

// Endpoint ini harus dipanggil oleh Vercel Cron setiap 1 menit
export async function POST(req) {
  try {
    // Keamanan: Validasi Secret Key untuk memastikan panggilan berasal dari Vercel/Sistem Internal
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabase();

    // Memanggil fungsi RPC PostgreSQL yang telah kita rancang di SRS
    // Fungsi 'enforce_strict_forfeits' menangani logika denda 100% dan rilis slot
    const { error } = await supabase.rpc("enforce_strict_forfeits", {
      current_utc_time: new Date().toISOString(),
    });

    if (error) {
      console.error("Cron Execution Failed:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Forfeit policy enforced successfully." });
  } catch (error) {
    console.error("Cron Critical Failure:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}