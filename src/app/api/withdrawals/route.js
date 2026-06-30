import { NextResponse } from "next/server";
import { getSupabaseUser } from "../../../lib/supabase";

export async function POST(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    if (!token) return NextResponse.json({ success: false, message: "Missing Token" }, { status: 401 });

    // FIX: Alirkan sesi otentikasi Super Admin ke PostgreSQL lewat Token-Bound Client
    const supabase = getSupabaseUser(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

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

    const { data: withdrawal, error: fetchErr } = await supabase
      .from('withdrawal_logs')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (fetchErr || !withdrawal) {
      return new NextResponse(JSON.stringify({ error: "Pengajuan tidak ditemukan atau sudah diproses." }), { status: 404 });
    }

    if (action === 'REJECT') {
      const { data: updatedReject, error: rejectErr } = await supabase
        .from('withdrawal_logs')
        .update({ status: 'REJECTED', resolved_by: user.id })
        .eq('id', withdrawalId)
        .eq('status', 'PENDING') 
        .select();

      if (rejectErr || !updatedReject || updatedReject.length === 0) {
        return new NextResponse(JSON.stringify({ error: "Transaksi telah kedaluwarsa atau diubah agen lain." }), { status: 409 });
      }
      return NextResponse.json({ success: true, message: "Penarikan ditolak." });
    }

    const { data: updatedLog, error: updateErr } = await supabase
      .from('withdrawal_logs')
      .update({ status: 'APPROVED', resolved_by: user.id })
      .eq('id', withdrawalId)
      .eq('status', 'PENDING') 
      .select();

    if (updateErr || !updatedLog || updatedLog.length === 0) {
      return new NextResponse(JSON.stringify({ error: "Konflik Konkurensi: Transaksi ini telah berhasil dieksekusi sebelumnya." }), { status: 409 });
    }

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