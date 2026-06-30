import { getSupabaseAdmin } from "../../../lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // FIX SINKRONISASI: Menyamakan penangkapan header kunci rahasia dengan berkas middleware.js
    const cronSecret = req.headers.get("x-cron-secret");
    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, message: "Unauthorized. Secret Mismatch." }, { status: 401 });
    }

    // Menggunakan admin client untuk memastikan fungsi sistem rpc memiliki wewenang penuh mengeksekusi denda
    const supabase = getSupabaseAdmin();

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