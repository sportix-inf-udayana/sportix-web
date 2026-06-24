/**
 * SPORTIX - ROUTE HANDLER API
 * Path: src/app/api/cron/route.js
 * Deskripsi SRS: 
 * Endpoint otomatisasi serverless (Vercel Cron Jobs) yang dipicu sistem secara periodik setiap 1 menit. Mengeksekusi fungsi otonom 
 * Forfeit Enforcement Agent (FEA) untuk menjaring transaksi no-show (customer terlambat hadir > 15 menit dari jam booking pertama), 
 * menyita dana sewa 100% masuk kas pendapatan bersih venue, dan mengembalikan slot sisa jam sewa tersebut ke status AVAILABLE.
 */

import { getSupabase } from "@/lib/supabase";

export async function GET(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) return new Response("DB Offline", { status: 503 });

    let currentWitaTime = new Date().toISOString();
    try {
      const { data, error } = await supabase.rpc("get_local_wita_time");
      if (!error && data) currentWitaTime = data;
    } catch (rpcErr) {}

    // Tarik reservasi PENDING beserta data waktu slot aktual
    const { data: lateReservations, error: fetchErr } = await supabase
      .from("reservations")
      .select(`id, field_id, status, total_amount, user_id, booking_date, start_time`)
      .eq("status", "PENDING");

    if (fetchErr) throw fetchErr;

    const forfeited = [];
    const currentTimeMs = new Date(currentWitaTime).getTime();

    for (const res of (lateReservations || [])) {
      // Kalkulasi berbasis jam main aktual, bukan jam transaksi dibuat
      const slotDateTimeStr = `${res.booking_date}T${res.start_time}+08:00`; // Asumsi WITA UTC+8
      const slotTimeMs = new Date(slotDateTimeStr).getTime();
      const fifteenMinutesInMs = 15 * 60 * 1000;
      
      if (currentTimeMs - slotTimeMs > fifteenMinutesInMs) {
        
        await supabase.from("reservations").update({ status: "FORFEITED" }).eq("id", res.id);
        
        if (res.field_id) {
          await supabase.from("slots").update({ status: "AVAILABLE" }).eq("id", res.field_id);
        }

        // Ledger mutlak: sesuai constraint tabel
        await supabase.from("ledger_transactions").insert({
          user_id: res.user_id,
          transaction_type: "DEBIT",
          source: "FORFEIT_REVENUE",
          amount: res.total_amount,
          reservation_id: res.id
        });

        forfeited.push(res.id);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      agent: "FEA Physical Mode",
      processed: forfeited.length,
      forfeitedIds: forfeited,
      executionMs: Date.now() - startTime
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}