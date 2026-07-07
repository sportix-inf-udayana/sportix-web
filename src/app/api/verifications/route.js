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

// Object Map untuk menggantikan ternary bersarang
const TABLE_MAP = {
  VENUE: 'venues',
  COACH: 'coaches',
  UMKM_STORE: 'umkm_stores'
};

async function verificationHandler(req, { user }) {
  if (user.user_metadata?.role !== ROLE.SUPER_ADMIN) {
    return NextResponse.json({ success: false, message: "Forbidden. Membutuhkan akses Super Admin." }, { status: 403 });
  }

  const body = await req.json();
  const { entityId, entityType, action } = verificationSchema.parse(body);

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ success: false, message: "Service Unavailable" }, { status: 503 });

  const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  const targetTable = TABLE_MAP[entityType];

  const { data: targetEntity, error: updateErr } = await supabase
    .from(targetTable)
    .update({ status: newStatus })
    .eq("id", entityId)
    .select()
    .single();

  if (updateErr || !targetEntity) throw updateErr;

  if (newStatus === 'APPROVED') {
    // Dynamic fallback field (owner_id atau user_id) 
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