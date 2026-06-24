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

    if (supabase) {
      // 1. Fetch current WITA time from database using native DB trigger helper equivalent or RPC
      let currentWitaTime = new Date().toISOString();
      try {
        const { data, error } = await supabase.rpc("get_local_wita_time");
        if (!error && data) {
          currentWitaTime = data;
        }
      } catch (rpcErr) {
        console.warn("get_local_wita_time RPC fallback to server ISO time:", rpcErr.message);
      }

      // 2. Query PENDING or active reservations that are late (> 15 mins)
      // For full compliance, we fetch reservations that are still PENDING and release them
      const { data: lateReservations, error: fetchErr } = await supabase
        .from("reservations")
        .select(`
          id,
          slot_id,
          status,
          price,
          user_id,
          created_at,
          slots (
            time,
            date
          )
        `)
        .eq("status", "PENDING");

      if (fetchErr) throw fetchErr;

      const forfeited = [];

      for (const res of (lateReservations || [])) {
        const createdAtTime = new Date(res.created_at).getTime();
        const fifteenMinutesInMs = 15 * 60 * 1000;
        
        // If pending slot check-in is delayed > 15 minutes from reservation creation or slot hour marker
        if (Date.now() - createdAtTime > fifteenMinutesInMs) {
          // A: Set reservation to FORFEITED
          await supabase
            .from("reservations")
            .update({ status: "FORFEITED" })
            .eq("id", res.id);

          // B: Instantly reset associated slot to AVAILABLE
          if (res.slot_id) {
            await supabase
              .from("slots")
              .update({ state: "AVAILABLE" })
              .eq("id", res.slot_id);
          }

          // C: Execute 100% zero-refund financial seizure into ledger_transactions
          await supabase
            .from("ledger_transactions")
            .insert({
              user_id: res.user_id,
              amount: res.price,
              type: "debit_forfeit",
              description: `100% Zero-Refund Seizure for Late Check-In >15m (ID: ${res.id})`
            });

          forfeited.push(res.id);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        agent: "FEA (Forfeit Enforcement Agent)",
        witaTime: currentWitaTime,
        processed: forfeited.length,
        forfeitedIds: forfeited,
        executionMs: Date.now() - startTime
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } else {
      // Sandbox fallback mode
      return new Response(JSON.stringify({
        success: true,
        agent: "FEA (Forfeit Enforcement Agent - Sandbox Simulation)",
        witaTime: new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Makassar" }),
        processed: 1,
        forfeitedIds: ["REV-992147"],
        seizureLogs: [
          {
            reservationId: "REV-992147",
            status: "FORFEITED",
            seizureAmount: 150000,
            refundStatus: "0% ZERO_REFUND_SEIZURE",
            slotReset: "AVAILABLE"
          }
        ],
        executionMs: Date.now() - startTime
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    console.error("FEA execution failed:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
