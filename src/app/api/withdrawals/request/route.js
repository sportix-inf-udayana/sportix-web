import { NextResponse } from "next/server";
import { getSupabase } from "../../../../lib/supabase";

export async function POST(req) {
  try {
    const supabase = getSupabase();
    if (!supabase) return new NextResponse("Service Unavailable", { status: 503 });

    // Verifikasi Sesi JWT
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { amount, bankName, accountNumber } = body;

    if (!amount || amount <= 0 || !bankName || !accountNumber) {
      return NextResponse.json({ success: false, message: "Payload penarikan tidak valid." }, { status: 400 });
    }

    // Cegah Exploit Chaining (Race Condition & Over-Withdrawal)
    // Cek apakah ada request penarikan yang masih PENDING. Jika ada, blokir!
    const { data: existingPending, error: pendingErr } = await supabase
      .from("withdrawal_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "PENDING")
      .limit(1);

    if (existingPending && existingPending.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Anda masih memiliki pengajuan penarikan yang sedang diproses. Harap tunggu." 
      }, { status: 429 });
    }

    // Tarik Saldo Aktual dari Tabel Balances (Single Source of Truth)
    const { data: balanceData, error: balanceErr } = await supabase
      .from("balances")
      .select("available_balance")
      .eq("user_id", user.id)
      .single();

    const actualBalance = balanceData?.available_balance || 0;

    // VALIDASI MUTLAK: Tolak jika klien mencoba menarik lebih dari saldo aktual
    if (amount > actualBalance) {
      console.warn(`[RED TEAM ALERT]: Percobaan eksploitasi over-withdrawal oleh user ${user.id}`);
      return NextResponse.json({ 
        success: false, 
        message: "Saldo tidak mencukupi. Manipulasi payload terdeteksi dan diblokir." 
      }, { status: 403 });
    }

    // Injeksi Data Pengajuan ke Log (Menunggu Approval Super Admin)
    const { error: insertErr } = await supabase
      .from("withdrawal_logs")
      .insert({
        user_id: user.id,
        amount: Number(amount),
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        status: "PENDING"
      });

    if (insertErr) throw insertErr;

    return NextResponse.json({
      success: true,
      message: "Pengajuan penarikan dana berhasil dicatat dan sedang ditinjau oleh Super Admin."
    });

  } catch (error) {
    console.error("Withdrawal Request Panic:", error);
    return NextResponse.json({ success: false, error: "Kesalahan server internal." }, { status: 500 });
  }
}