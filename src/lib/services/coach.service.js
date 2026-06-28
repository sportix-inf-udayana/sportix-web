export async function getCoachWalletData(supabase, userId) {
  // 1. Tarik Saldo Dompet Fisik
  const { data: balanceData, error: balanceError } = await supabase
    .from("balances")
    .select("available_balance, pending_balance")
    .eq("user_id", userId)
    .single();

  // 2. Tarik Riwayat Buku Besar (Ledger Transactions)
  const { data: ledgerHistory, error: ledgerError } = await supabase
    .from("ledger_transactions")
    .select("id, transaction_type, source, amount, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (balanceError || ledgerError) {
    console.error("Fetch Coach Wallet Error:", balanceError || ledgerError);
  }

  return {
    availableBalance: balanceData?.available_balance || 0,
    pendingBalance: balanceData?.pending_balance || 0,
    ledgerHistory: ledgerHistory || [],
  };
}

export async function getCoachScheduleData(supabase, userId) {
  const { data: coachProfile } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!coachProfile) return { coachProfile: null };

  const { data: balanceData } = await supabase
    .from("balances")
    .select("available_balance")
    .eq("user_id", userId)
    .single();

  const { data: recentActivity } = await supabase
    .from("ledger_transactions")
    .select("id, source, amount, created_at, transaction_type")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);

  const today = new Date().toISOString().split('T')[0];
  const { data: schedules } = await supabase
    .from("coach_bookings")
    .select(`
      id, booking_date, start_time, end_time, status,
      users (full_name)
    `)
    .eq("coach_id", coachProfile.id)
    .gte("booking_date", today)
    .order("booking_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(10);

  return {
    coachProfile,
    balance: balanceData?.available_balance || 0,
    recentActivity: recentActivity || [],
    schedules: schedules || []
  };
}