import { getSupabase } from "@/lib/supabase";

export async function GET(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) return new Response("DB Offline", { status: 503 });

    // 1. Dapatkan tanggal hari ini di zona WITA
    let reportDate = new Date().toISOString().split('T')[0]; // Fallback
    try {
      const { data, error } = await supabase.rpc("get_local_wita_time");
      if (!error && data) {
        reportDate = data.split('T')[0]; // Ambil YYYY-MM-DD
      }
    } catch (rpcErr) {}

    // 2. Tarik semua transaksi ledger hari ini untuk pengelompokan (Hanya CREDIT dan FORFEIT)
    // Asumsi: Semua revenue masuk via ledger_transactions untuk menjaga single source of truth
    const { data: todayTransactions, error: fetchErr } = await supabase
      .from("ledger_transactions")
      .select("amount, source, reservation_id, reservations(field_id, status)")
      .gte("created_at", `${reportDate}T00:00:00+08:00`)
      .lt("created_at", `${reportDate}T23:59:59+08:00`);

    if (fetchErr) throw fetchErr;

    // 3. Agregasi data per venue (melalui field_id di relasi reservations)
    // Catatan: Anda perlu JOIN ke fields lalu ke venues jika arsitekturnya kompleks, 
    // ini adalah agregasi dasar berdasarkan data ledger.
    let venueStats = {};

    (todayTransactions || []).forEach(trx => {
      // Lewati jika bukan transaksi terkait lapangan (misal UMKM/Turnamen)
      if (trx.source !== 'COURT_BOOKING' && trx.source !== 'FORFEIT_REVENUE') return;
      
      const venueId = trx.reservations?.fields?.venue_id || "DEFAULT_VENUE_ID"; // Sesuaikan JOIN fisik Anda
      
      if (!venueStats[venueId]) {
        venueStats[venueId] = { opRev: 0, forfeitRev: 0, bookings: 0, noShows: 0 };
      }

      if (trx.source === 'COURT_BOOKING') {
        venueStats[venueId].opRev += Number(trx.amount);
        venueStats[venueId].bookings += 1;
      } else if (trx.source === 'FORFEIT_REVENUE') {
        venueStats[venueId].forfeitRev += Number(trx.amount);
        venueStats[venueId].noShows += 1;
      }
    });

    // 4. Eksekusi Upsert ke revenue_reports
    const upsertPromises = Object.keys(venueStats).map(vId => {
      return supabase.from("revenue_reports").upsert({
        venue_id: vId,
        report_date: reportDate,
        operational_revenue: venueStats[vId].opRev,
        forfeited_revenue: venueStats[vId].forfeitRev,
        total_bookings: venueStats[vId].bookings,
        total_no_shows: venueStats[vId].noShows,
        updated_at: new Date().toISOString()
      }, { onConflict: 'venue_id, report_date' });
    });

    await Promise.all(upsertPromises);

    return new Response(JSON.stringify({
      success: true,
      agent: "ARA (Analytics Reporting Agent)",
      dateProcessed: reportDate,
      venuesAggregated: Object.keys(venueStats).length,
      executionMs: Date.now() - startTime
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}