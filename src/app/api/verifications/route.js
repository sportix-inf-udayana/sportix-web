import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuthAndCatch } from "../../../lib/api-wrapper";
import { getSupabaseAdmin } from "../../../lib/supabase";
import { ROLE } from "../../../lib/constants";

const verificationSchema = z.object({
  entityId: z.string().uuid("ID Entitas tidak valid"),
  entityType: z.enum(['VENUE', 'COACH', 'UMKM_STORE']),
  action: z.enum(['APPROVE', 'REJECT'])
});

async function verificationHandler(req, { user }) {
  // 1. Validasi Otoritas Mutlak
  if (user.user_metadata?.role !== ROLE.SUPER_ADMIN) {
    return NextResponse.json({ success: false, message: "Forbidden. Membutuhkan akses Super Admin." }, { status: 403 });
  }

  // 2. Validasi Payload
  const body = await req.json();
  const { entityId, entityType, action } = verificationSchema.parse(body);

  // 3. Gunakan Admin Client HANYA untuk Super Admin (Bypass RLS untuk modifikasi tenant lain)
  const supabase = getSupabaseAdmin();
  if (!supabase) return new NextResponse("Service Unavailable", { status: 503 });

  const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  const targetTable = entityType === 'VENUE' ? 'venues' : entityType === 'COACH' ? 'coaches' : 'umkm_stores';

  const { data: targetEntity, error: updateErr } = await supabase
    .from(targetTable)
    .update({ status: newStatus })
    .eq("id", entityId)
    .select()
    .single();

  if (updateErr || !targetEntity) throw updateErr;

  // 4. Inisialisasi Dompet Kas
  if (newStatus === 'APPROVED') {
    const targetUserId = targetEntity.owner_id || targetEntity.user_id;
    if (targetUserId) {
      const { data: existingBalance } = await supabase.from("balances").select("id").eq("user_id", targetUserId).maybeSingle();
      if (!existingBalance) {
        await supabase.from("balances").insert({ user_id: targetUserId, available_balance: 0, pending_balance: 0 });
      }
    }
  }

  return NextResponse.json({ success: true, message: `${entityType} berhasil di-${newStatus}.` });
}

export const POST = withAuthAndCatch(verificationHandler);