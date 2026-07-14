import { AppError } from '@/lib/api-wrapper';

export async function getCoachWalletData(supabase, userId) {
  if (!userId) throw new AppError('User ID is required.', 400);

  const [
    { data: balance, error: balanceErr },
    { data: ledger, error: ledgerErr }
  ] = await Promise.all([
    supabase
      .from('balances')
      .select('available_balance, pending_balance')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('ledger_transactions')
      .select('id, transaction_type, source, amount, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
  ]);

  if (balanceErr) throw new AppError(`Balance error: ${balanceErr.message}`, 500);
  if (ledgerErr) throw new AppError(`Ledger error: ${ledgerErr.message}`, 500);

  return {
    data: {
      availableBalance: balance?.available_balance || 0,
      pendingBalance: balance?.pending_balance || 0,
      ledgerHistory: ledger || [],
    },
    error: null
  };
}

export async function getCoachScheduleData(supabase, userId) {
  if (!userId) throw new AppError('User ID is required.', 400);

  const { data: coachProfile, error: profileErr } = await supabase
    .from('coaches')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileErr) throw new AppError(`Profile error: ${profileErr.message}`, 500);
  if (!coachProfile) return { data: { coachProfile: null }, error: null };

  const todayWITA = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Makassar' });

  const [
    { data: balance, error: balanceErr },
    { data: activity, error: activityErr },
    { data: schedules, error: scheduleErr }
  ] = await Promise.all([
    supabase
      .from('balances')
      .select('available_balance')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('ledger_transactions')
      .select('id, source, amount, created_at, transaction_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('coach_bookings')
      .select('id, booking_date, start_time, end_time, status, users (full_name)')
      .eq('coach_id', coachProfile.id)
      .gte('booking_date', todayWITA)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(10)
  ]);

  if (balanceErr || activityErr || scheduleErr) {
    throw new AppError('Gagal memuat data jadwal instruktur.', 500);
  }

  return {
    data: {
      coachProfile,
      balance: balance?.available_balance || 0,
      recentActivity: activity || [],
      schedules: schedules || []
    },
    error: null
  };
}