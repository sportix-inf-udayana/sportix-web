export async function getPendingVenues(supabase) {
  try {
    const { data, error } = await supabase
      .from("venues")
      .select("id, name, address, status, owner_id")
      .eq("status", "PENDING")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Fetch Pending Venues Error:", error);
    return { data: null, error };
  }
}

export async function getOwnerVenue(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from("venues")
      .select("id, name")
      .eq("owner_id", userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Fetch Owner Venue Error:", error);
    return { data: null, error };
  }
}

export async function getVenueSlots(supabase, venueId, targetDate) {
  try {
    const { data, error } = await supabase
      .from("slots")
      .select(`
        id, time, status, price, locked_until,
        reservations ( id, status, payment_gateway_ref, users(full_name, phone) )
      `)
      .eq("venue_id", venueId)
      .eq("date", targetDate)
      .order("time", { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Fetch Venue Slots Error:", error);
    return { data: [], error };
  }
}

export async function getGlobalFinancialMetrics(supabase) {
  try {
    // Kalkulasi dilakukan secara paralel menggunakan Promise.all untuk optimasi performance
    const [volumeRes, forfeitedRes, refundRes, ledgerRes] = await Promise.all([
      supabase.from("ledger_transactions").select("amount").eq("transaction_type", "CREDIT"),
      supabase.from("reservations").select("*", { count: 'exact', head: true }).in("status", ["EXPIRED_PAID", "FORFEITED"]),
      supabase.from("refund_logs").select("*", { count: 'exact', head: true }).eq("status", "PENDING_ACTION"),
      supabase.from("ledger_transactions").select("id, transaction_type, source, amount, created_at, user_id").order("created_at", { ascending: false }).limit(50)
    ]);

    const totalVolume = volumeRes.data?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
    
    return {
      totalVolume,
      forfeitedCount: forfeitedRes.count || 0,
      unprocessedRefundsCount: refundRes.count || 0,
      ledgerStream: ledgerRes.data || [],
      integrityMismatch: (refundRes.count || 0) > 0 ? (refundRes.count || 0) : 0,
      error: null
    };
  } catch (error) {
    console.error("Global Financial Metrics Error:", error);
    return { error: error.message };
  }
}

export async function getVenueReports(supabase, userId) {
  try {
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("id, name")
      .eq("owner_id", userId)
      .single();

    if (venueError) throw venueError;

    const { data: reports, error: reportError } = await supabase
      .from("revenue_reports")
      .select("*")
      .eq("venue_id", venue.id)
      .order("report_date", { ascending: false })
      .limit(30);

    if (reportError) throw reportError;

    const totals = {
      revenue: reports?.reduce((acc, curr) => acc + Number(curr.operational_revenue), 0) || 0,
      forfeit: reports?.reduce((acc, curr) => acc + Number(curr.forfeited_revenue), 0) || 0,
      noShows: reports?.reduce((acc, curr) => acc + Number(curr.total_no_shows), 0) || 0,
    };

    return { venue, reports: reports || [], totals, error: null };
  } catch (error) {
    console.error("Fetch Venue Reports Error:", error);
    return { venue: null, reports: [], totals: null, error };
  }
}