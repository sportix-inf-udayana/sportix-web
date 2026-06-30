import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return new NextResponse("Service Unavailable", { status: 503 });

    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new NextResponse("Unauthorized", { status: 401 });

    const { data: adminUser } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: "Forbidden. Membutuhkan akses Super Admin." }, { status: 403 });
    }

    const body = await req.json();
    const { entityId, entityType, action } = body; 

    if (!entityId || !entityType || !action) {
      return NextResponse.json({ success: false, message: "Parameter validasi tidak lengkap." }, { status: 400 });
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    let targetTable = '';

    switch (entityType) {
      case 'VENUE': targetTable = 'venues'; break;
      case 'COACH': targetTable = 'coaches'; break;
      case 'UMKM_STORE': targetTable = 'umkm_stores'; break;
      default: return NextResponse.json({ success: false, message: "Tipe entitas tidak valid." }, { status: 400 });
    }

    const { data: targetEntity, error: updateErr } = await supabase
      .from(targetTable)
      .update({ status: newStatus })
      .eq("id", entityId)
      .select()
      .single();

    if (updateErr || !targetEntity) {
      console.error("Verification Update Error:", updateErr);
      return NextResponse.json({ success: false, message: `Gagal memperbarui status pada tabel ${targetTable}.` }, { status: 500 });
    }

    // FIX LOGIKA BISNIS: Inisialisasi baris saldo kas awal 0 rupiah agar tidak memicu crash .single() di dashboard mitra
    if (newStatus === 'APPROVED') {
      const targetUserId = targetEntity.owner_id || targetEntity.user_id;
      
      if (targetUserId) {
        const { data: existingBalance } = await supabase
          .from("balances")
          .select("id")
          .eq("user_id", targetUserId)
          .maybeSingle();

        if (!existingBalance) {
          await supabase.from("balances").insert({
            user_id: targetUserId,
            available_balance: 0,
            pending_balance: 0
          });
          console.log(`[SPORTIX LEDGER]: Berhasil membuat dompet kas awal untuk user ${targetUserId}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${entityType} berhasil di-${newStatus} beserta inisialisasi dompet kas terkait.`,
      executionMs: Date.now() - startTime
    });

  } catch (error) {
    console.error("Verification API Panic:", error);
    return NextResponse.json({ success: false, error: "Kesalahan internal server." }, { status: 500 });
  }
}