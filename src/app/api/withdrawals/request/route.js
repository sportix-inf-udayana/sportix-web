import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuthAndCatch } from "../../../../lib/api-wrapper";

const withdrawSchema = z.object({
  amount: z.number().positive()
});

async function requestWithdrawalHandler(req, { supabase, user }) {
  const { amount } = withdrawSchema.parse(await req.json());

  // Cek saldo
  const { data: balance } = await supabase
    .from("balances")
    .select("available_balance")
    .eq("user_id", user.id)
    .single();

  if (!balance || balance.available_balance < amount) {
    return NextResponse.json({ success: false, message: "Saldo tidak mencukupi." }, { status: 400 });
  }

  // Buat request
  await supabase.from("withdrawals").insert({
    user_id: user.id,
    amount,
    status: "PENDING"
  });

  return NextResponse.json({ success: true, message: "Permintaan penarikan dikirim." });
}

export const POST = withAuthAndCatch(requestWithdrawalHandler);