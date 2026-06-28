export async function getCoachWalletData(supabase, userId) {
  try {
    // Optimasi: Fetch balance dan ledger secara paralel
    const [balanceRes, ledgerRes] = await Promise.all([
      supabase.from("balances").select("available_balance, pending_balance").eq("user_id", userId).single(),
      supabase.from("ledger_transactions").select("id, transaction_type, source, amount, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20)
    ]);

    if (balanceRes.error) throw balanceRes.error;

    return {
      data: {
        availableBalance: balanceRes.data?.available_balance || 0,
        pendingBalance: balanceRes.data?.pending_balance || 0,
        ledgerHistory: ledgerRes.data || [],
      },
      error: null
    };
  } catch (error) {
    console.error("Fetch Coach Wallet Error:", error);
    return { data: null, error };
  }
}

export async function getCoachScheduleData(supabase, userId) {
  try {
    // 1. Ambil Profil Pelatih terlebih dahulu karena data lain bergantung padanya
    const { data: coachProfile, error: profileErr } = await supabase
      .from("coaches")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (profileErr) throw profileErr;
    if (!coachProfile) return { data: { coachProfile: null }, error: null };

    const today = new Date().toISOString().split('T')[0];

    // 2. Fetch data paralel untuk dashboard utama
    const [balanceRes, activityRes, scheduleRes] = await Promise.all([
      supabase.from("balances").select("available_balance").eq("user_id", userId).single(),
      supabase.from("ledger_transactions").select("id, source, amount, created_at, transaction_type").eq("user_id", userId).order("created_at", { ascending: false }).limit(3),
      supabase.from("coach_bookings").select("id, booking_date, start_time, end_time, status, users (full_name)").eq("coach_id", coachProfile.id).gte("booking_date", today).order("booking_date", { ascending: true }).order("start_time", { ascending: true }).limit(10)
    ]);

    return {
      data: {
        coachProfile,
        balance: balanceRes.data?.available_balance || 0,
        recentActivity: activityRes.data || [],
        schedules: scheduleRes.data || []
      },
      error: null
    };
  } catch (error) {
    console.error("Fetch Coach Schedule Error:", error);
    return { data: null, error };
  }
}