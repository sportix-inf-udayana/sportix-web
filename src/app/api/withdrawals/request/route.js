import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuthAndCatch } from "../../../../lib/api-wrapper";

const withdrawalSchema = z.object({
  amount: z.number().positive("Nominal harus lebih besar dari 0"),
  bankName: z.string().min(2, "Nama bank tidak valid"),
  accountNumber: z.string().min(5, "Nomor rekening tidak valid")
});

async function withdrawalHandler(req, { supabase, user }) {
  const body = await req.json();
  const { amount, bankName, accountNumber } = withdrawalSchema.parse(body);

  const { data: existingPending } = await supabase
    .from("withdrawal_logs")
    .select("id")
    .eq("status", "PENDING")
    .limit(1);

  if (existingPending && existingPending.length > 0) {
    return NextResponse.json({ success: false, message: "Ada pengajuan dana yang sedang diproses." }, { status: 429 });
  }

  const { data: balanceData } = await supabase.from("balances").select("available_balance").single();
  const actualBalance = balanceData?.available_balance || 0;

  if (amount > actualBalance) {
    return NextResponse.json({ success: false, message: "Saldo tidak mencukupi." }, { status: 403 });
  }

  const { error: insertErr } = await supabase.from("withdrawal_logs").insert({
    amount, bank_name: bankName.trim(), account_number: accountNumber.trim(), status: "PENDING"
  });

  if (insertErr?.code === "23505") {
    return NextResponse.json({ success: false, message: "Request ganda diblokir sistem." }, { status: 409 });
  }
  if (insertErr) throw insertErr;

  return NextResponse.json({ success: true, message: "Pengajuan penarikan dana dicatat." });
}

export const POST = withAuthAndCatch(withdrawalHandler);