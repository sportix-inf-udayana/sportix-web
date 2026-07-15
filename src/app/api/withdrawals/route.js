// src/app/api/withdrawals/route.js
import { withAuthAndCatch } from '@/lib/api-wrapper';
import { USER_ROLES } from '@/lib/constants';

export const GET = withAuthAndCatch(async (req, { supabase, user }) => {
  const role = user.user_metadata?.role;
  
  let query = supabase
    .from('withdrawals')
    .select('id, amount, bank_name, account_number, status, created_at, profiles(full_name)')
    .order('created_at', { ascending: false });

  if (role !== USER_ROLES.SUPER_ADMIN) {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
});