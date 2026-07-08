export async function getGlobalFinancialMetrics(supabase) {
  try {
    const { data: ledger, error: ledgerError } = await supabase
      .from("ledger_transactions")
      .select("id, transaction_type, source, amount, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (ledgerError) throw ledgerError;

    // Hitung total forfeit
    const { count: forfeitedCount } = await supabase
      .from("reservations")
      .select("id", { count: 'exact', head: true })
      .eq("status", "FORFEITED");

    // Hitung total refund gantung
    const { count: refundCount } = await supabase
      .from("refund_logs")
      .select("id", { count: 'exact', head: true })
      .eq("status", "PENDING_ACTION");

    // Akumulasi volume kredit
    const totalVolume = ledger
      ?.filter(tx => tx.transaction_type === "CREDIT")
      ?.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;

    return {
      integrityMismatch: 0, 
      forfeitedCount: forfeitedCount || 0,
      unprocessedRefundsCount: refundCount || 0,
      totalVolume,
      ledgerStream: ledger || []
    };
  } catch (error) {
    console.error("Global Financial Metrics Fetch Error:", error);
    return null;
  }
}