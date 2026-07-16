// src/app/api/verifications/route.js
import { z } from 'zod';
import { withAuthAndCatch, AppError } from '@/lib/api-wrapper';
import { getSupabaseAdmin } from '@/lib/supabase';
import { USER_ROLES, ENTITY_STATUS } from '@/lib/constants';

const verificationSchema = z.object({
  entityId: z.string().uuid(),
  entityType: z.enum(['VENUE', 'COACH', 'UMKM_STORE']),
  action: z.enum(['APPROVE', 'REJECT'])
});

const TABLE_MAP = {
  VENUE: 'venues',
  COACH: 'coaches',
  UMKM_STORE: 'umkm_stores'
};

export const POST = withAuthAndCatch(async (req, { user }) => {
  if (user.user_metadata?.role !== USER_ROLES.SUPER_ADMIN) {
    throw new AppError('Forbidden. Khusus Super Admin.', 403);
  }

  const payload = verificationSchema.parse(await req.json());
  const supabase = getSupabaseAdmin();

  const newStatus = payload.action === 'APPROVE' ? ENTITY_STATUS.APPROVED : ENTITY_STATUS.REJECTED;
  const targetTable = TABLE_MAP[payload.entityType];

  // LOGIC FIX: Jika entitas Venue disetujui, paksa is_active menjadi true
  const updatePayload = { status: newStatus };
  if (payload.entityType === 'VENUE' && newStatus === ENTITY_STATUS.APPROVED) {
    updatePayload.is_active = true;
  }

  const { data, error } = await supabase
    .from(targetTable)
    .update(updatePayload)
    .eq('id', payload.entityId)
    .select('id')
    .single();

  if (error || !data) {
    throw new AppError(`Gagal memperbarui status ${payload.entityType}.`, 500);
  }

  return { message: `${payload.entityType} berhasil diperbarui menjadi ${newStatus}.` };
});