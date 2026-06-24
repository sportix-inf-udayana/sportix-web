import { getSupabase } from "@/lib/supabase";

export async function POST(req) {
  const startTime = Date.now();
  try {
    const supabase = getSupabase();
    if (!supabase) return new Response("Service Unavailable", { status: 503 });

    // 1. Otorisasi Mutlak: Harus Super Admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response("Unauthorized", { status: 401 });

    const { data: adminUser } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
      return new Response(JSON.stringify({ success: false, message: "Forbidden. Membutuhkan akses Super Admin." }), { status: 403 });
    }

    const body = await req.json();
    // entityType = 'VENUE' | 'COACH' | 'UMKM_STORE'
    // action = 'APPROVE' | 'REJECT'
    const { entityId, entityType, action } = body; 

    if (!entityId || !entityType || !action) {
      return new Response(JSON.stringify({ success: false, message: "Parameter validasi tidak lengkap." }), { status: 400 });
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    let targetTable = '';

    switch (entityType) {
      case 'VENUE': targetTable = 'venues'; break;
      case 'COACH': targetTable = 'coaches'; break;
      case 'UMKM_STORE': targetTable = 'umkm_stores'; break;
      default: return new Response(JSON.stringify({ success: false, message: "Tipe entitas tidak valid." }), { status: 400 });
    }

    // 2. Eksekusi Pembaruan Status
    const { data, error: updateErr } = await supabase
      .from(targetTable)
      .update({ status: newStatus })
      .eq("id", entityId)
      .select()
      .single();

    if (updateErr || !data) {
      return new Response(JSON.stringify({ success: false, message: `Gagal memperbarui status pada tabel ${targetTable}.` }), { status: 500 });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${entityType} berhasil di-${newStatus}.`,
      executionMs: Date.now() - startTime
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}