import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";

export async function POST(req) {
  try {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Database offline.");

    // Verifikasi Kriptografi Lapis 2
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user || user.user_metadata?.role !== 'SUPER_ADMIN') {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        message: "Akses Ditolak: Hanya Super Admin yang diizinkan mengaudit finansial." 
      }), { status: 403 });
    }

    const { withdrawalId, action } = await req.json();

    if (!withdrawalId || !['APPROVE', 'REJECT'].includes(action)) {
      return new NextResponse(JSON.stringify({ error: "Payload tidak valid." }), { status: 400 });
    }

    // Ambil data pengajuan penarikan
    const { data: withdrawal, error: fetchErr } = await supabase
      .from('withdrawal_logs')
      .select('*')
      .eq('id', withdrawalId)
      .eq('status', 'PENDING') // Hanya yang pending yang boleh diproses
      .single();

    if (fetchErr || !withdrawal) {
      return new NextResponse(JSON.stringify({ error: "Pengajuan tidak ditemukan atau sudah diproses." }), { status: 404 });
    }

    if (action === 'REJECT') {
      await supabase
        .from('withdrawal_logs')
        .update({ status: 'REJECTED', resolved_by: user.id })
        .eq('id', withdrawalId);
        
      return NextResponse.json({ success: true, message: "Penarikan ditolak." });
    }

    // LOGIKA INTI: APPROVAL & DOUBLE-ENTRY LEDGER ENFORCEMENT
    // Jika disetujui, JANGAN mengubah saldo tabel 'balances' secara manual!
    // Suntikkan ke ledger, biarkan PostgreSQL Trigger yang bekerja secara presisi (Imutabilitas Data Finansial).
    const { error: updateErr } = await supabase
      .from('withdrawal_logs')
      .update({ status: 'APPROVED', resolved_by: user.id })
      .eq('id', withdrawalId);

    if (updateErr) throw updateErr;

    // Memasukkan entri DEBIT ke buku besar. Trigger 'process_ledger_balance' akan memotong saldo otomatis.
    const { error: ledgerErr } = await supabase
      .from('ledger_transactions')
      .insert({
        user_id: withdrawal.user_id,
        transaction_type: 'DEBIT',
        source: 'WITHDRAWAL',
        amount: withdrawal.amount,
        withdrawal_id: withdrawal.id
      });

    if (ledgerErr) {
      console.error("FATAL: Ledger insertion failed after withdrawal approval!", ledgerErr);
      throw ledgerErr;
    }

    return NextResponse.json({ 
      success: true, 
      message: "Penarikan sukses. Ledger DEBIT tercipta dan saldo termutasi otonom." 
    });

  } catch (error) {
    console.error("Withdrawal API Error:", error);
    return new NextResponse(JSON.stringify({ success: false, error: "Kesalahan server." }), { status: 500 });
  }
}