// src/app/api/withdrawals/request/route.js
import { z } from 'zod';
import { withAuthAndCatch, AppError } from '@/lib/api-wrapper';
import { TRANSACTION_TYPE } from '@/lib/constants';

const withdrawSchema = z.object({
  amount: z.coerce.number().positive().min(50000),
  bank_name: z.string().min(2),
  account_number: z.string().min(5)
});

export const POST = withAuthAndCatch(async (req, { supabase, user }) => {
  const payload = withdrawSchema.parse(await req.json());

  const { data: balance, error: balanceErr } = await supabase
    .from('balances')
    .select('amount')
    .eq('user_id', user.id)
    .single();

  if (balanceErr || !balance || Number(balance.amount) < payload.amount) {
    throw new AppError('Saldo tidak mencukupi atau gagal memuat data.', 400);
  }

  const newAmount = Number(balance.amount) - payload.amount;

  const { data: updatedBalance, error: updateErr } = await supabase
    .from('balances')
    .update({ amount: newAmount, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('amount', balance.amount)
    .select('id')
    .single();

  if (updateErr || !updatedBalance) {
    throw new AppError('Race condition terdeteksi. Silakan coba lagi.', 409);
  }

  const { data: withdrawal, error: withdrawErr } = await supabase
    .from('withdrawals')
    .insert({
      user_id: user.id,
      amount: payload.amount,
      bank_name: payload.bank_name,
      account_number: payload.account_number,
      status: 'PENDING'
    })
    .select('id')
    .single();

  if (withdrawErr) {
    await supabase
      .from('balances')
      .update({ amount: balance.amount, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    throw new AppError('Gagal mencatat penarikan. Saldo telah dikembalikan.', 500);
  }

  const { error: ledgerErr } = await supabase
    .from('ledger_transactions')
    .insert({
      user_id: user.id,
      transaction_type: TRANSACTION_TYPE.DEBIT,
      source: `WITHDRAWAL_${withdrawal.id}`,
      amount: payload.amount
    });

  if (ledgerErr) {
    console.error(`[LEDGER_FAIL] Withdrawal ID: ${withdrawal.id}`, ledgerErr);
  }

  return { message: 'Permintaan penarikan berhasil diproses.' };
});