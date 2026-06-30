import { NextResponse } from "next/server";
import { getSupabaseUser } from "../../../../lib/supabase";

export async function POST(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) return new NextResponse("Unauthorized. Missing Token.", { status: 401 });

    // Hubungkan client dengan Bearer token yang valid agar RLS di database aktif
    const supabase = getSupabaseUser(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return new NextResponse("Unauthorized. Invalid JWT.", { status: 401 });

    const body = await req.json();
    const { amount, bankName, accountNumber } = body;

    if (!amount || amount <= 0 || !bankName || !accountNumber) {
      return NextResponse.json({ success: false, message: "Payload penarikan tidak valid." }, { status: 400 });
    }

    // Database RLS otomatis membatasi query ini hanya untuk user_id yang cocok dengan auth.uid() token
    const { data: existingPending } = await supabase
      .from("withdrawal_logs")
      .select("id")
      .eq("status", "PENDING")
      .limit(1);

    if (existingPending && existingPending.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Anda masih memiliki pengajuan penarikan dana yang sedang diproses." 
      }, { status: 429 });
    }

    // Pengambilan data saldo dilindungi secara otonom oleh RLS (Tidak memerlukan klausa manual .eq('user_id', user.id))
    const { data: balanceData } = await supabase
      .from("balances")
      .select("available_balance")
      .single();

    const actualBalance = balanceData?.available_balance || 0;

    if (amount > actualBalance) {
      console.warn(`[SECURITY WARN]: User ${user.id} mencoba menarik dana melebihi batas saldo riil.`);
      return NextResponse.json({ 
        success: false, 
        message: "Saldo tidak mencukupi untuk melakukan operasi penarikan." 
      }, { status: 403 });
    }

    // Penyisipan data langsung mewarisi kepemilikan user_id via database default value (auth.uid())
    const { error: insertErr } = await supabase
      .from("withdrawal_logs")
      .insert({
        amount: Number(amount),
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        status: "PENDING"
      });

    if (insertErr) {
      if (insertErr.code === "23505") {
        return NextResponse.json({ 
          success: false, 
          message: "Aktivitas transaksi mencurigakan terdeteksi. Request ganda diblokir sistem." 
        }, { status: 409 });
      }
      throw insertErr;
    }

    return NextResponse.json({
      success: true,
      message: "Pengajuan penarikan dana berhasil dicatat dan sedang ditinjau oleh Super Admin."
    });

  } catch (error) {
    console.error("Withdrawal Request Panic:", error);
    return NextResponse.json({ success: false, error: "Kesalahan server internal." }, { status: 500 });
  }
}