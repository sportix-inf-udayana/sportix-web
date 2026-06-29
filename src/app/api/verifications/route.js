import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) return new NextResponse("Service Unavailable", { status: 503 });

    // Otorisasi Mutlak: Harus Super Admin
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

    // Eksekusi Pembaruan Status ke Database Nyata
    const { data, error: updateErr } = await supabase
      .from(targetTable)
      .update({ status: newStatus })
      .eq("id", entityId)
      .select()
      .single();

    if (updateErr || !data) {
      console.error("Verification Update Error:", updateErr);
      return NextResponse.json({ success: false, message: `Gagal memperbarui status pada tabel ${targetTable}.` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${entityType} berhasil di-${newStatus}.`,
      executionMs: Date.now() - startTime
    });

  } catch (error) {
    console.error("Verification API Panic:", error);
    return NextResponse.json({ success: false, error: "Kesalahan internal server." }, { status: 500 });
  }
}