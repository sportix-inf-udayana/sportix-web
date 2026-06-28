// Mengambil daftar arena yang menunggu persetujuan (Super Admin)
export async function getPendingVenues(supabase) {
  const { data, error } = await supabase
    .from("venues")
    .select("id, name, address, status, owner_id")
    .eq("status", "PENDING")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Fetch Pending Venues Error:", error);
    return { data: null, error };
  }
  return { data, error: null };
}

// Mengambil data arena berdasarkan ID pemilik (Admin Venue)
export async function getOwnerVenue(supabase, userId) {
  const { data, error } = await supabase
    .from("venues")
    .select("id, name")
    .eq("owner_id", userId)
    .single();

  return { data, error };
}

// Mengambil data slot fisik beserta relasi pemesanan (Admin Venue)
export async function getVenueSlots(supabase, venueId, targetDate) {
  const { data, error } = await supabase
    .from("slots")
    .select(`
      id, time, status, price, locked_until,
      reservations ( id, status, payment_gateway_ref, users(full_name, phone) )
    `)
    .eq("venue_id", venueId)
    .eq("date", targetDate)
    .order("time", { ascending: true });

  if (error) {
    console.error("Fetch Venue Slots Error:", error);
    return { data: [], error };
  }
  return { data, error: null };
}

export async function getGlobalFinancialMetrics(supabase) {
  // A. Kalkulasi Total Volume
  const { data: volumeData, error: volumeErr } = await supabase
    .from("ledger_transactions")
    .select("amount")
    .eq("transaction_type", "CREDIT");
  
  const totalVolume = volumeData?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

  // B. Kalkulasi Forfeits
  const { count: forfeitedCount } = await supabase
    .from("reservations")
    .select("*", { count: 'exact', head: true })
    .in("status", ["EXPIRED_PAID", "FORFEITED"]);

  // C. Kalkulasi Unprocessed Refunds
  const { count: unprocessedRefundsCount } = await supabase
    .from("refund_logs")
    .select("*", { count: 'exact', head: true })
    .eq("status", "PENDING_ACTION");

  // D. Tarik Stream Ledger Real-Time
  const { data: ledgerStream } = await supabase
    .from("ledger_transactions")
    .select("id, transaction_type, source, amount, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(50);

  const integrityMismatch = unprocessedRefundsCount > 0 ? unprocessedRefundsCount : 0;

  return { totalVolume, forfeitedCount, unprocessedRefundsCount, ledgerStream, integrityMismatch, error: volumeErr };
}

// Tambahkan di bagian bawah src/lib/services/admin.service.js

export async function getVenueReports(supabase, userId) {
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("id, name")
    .eq("owner_id", userId)
    .single();

  if (venueError || !venue) {
    return { venue: null, reports: [], totals: null, error: venueError };
  }

  const { data: reports, error: reportError } = await supabase
    .from("revenue_reports")
    .select("*")
    .eq("venue_id", venue.id)
    .order("report_date", { ascending: false })
    .limit(30);

  if (reportError) {
    console.error("Fetch Venue Reports Error:", reportError);
    return { venue, reports: [], totals: null, error: reportError };
  }

  // Kalkulasi dieksekusi di Data Layer, bukan di komponen antarmuka
  const totals = {
    revenue: reports?.reduce((acc, curr) => acc + Number(curr.operational_revenue), 0) || 0,
    forfeit: reports?.reduce((acc, curr) => acc + Number(curr.forfeited_revenue), 0) || 0,
    noShows: reports?.reduce((acc, curr) => acc + Number(curr.total_no_shows), 0) || 0,
  };

  return { venue, reports: reports || [], totals, error: null };
}