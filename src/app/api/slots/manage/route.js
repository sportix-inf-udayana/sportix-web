// src/app/api/slots/manage/route.js
import { z } from 'zod';
import { withAuthAndCatch } from '@/lib/api-wrapper';
import { AdminService } from '@/lib/services/admin.service';
import { SLOT_STATUS } from '@/lib/constants';

const manageSlotSchema = z.object({
  slotId: z.string().uuid(),
  targetState: z.enum([SLOT_STATUS.AVAILABLE, SLOT_STATUS.UNAVAILABLE]),
  expectedCurrentState: z.string().optional()
});

export const PATCH = withAuthAndCatch(async (req, { supabase, user }) => {
  const payload = manageSlotSchema.parse(await req.json());
  
  return await AdminService.updateSlotStatus({
    supabase,
    userId: user.id,
    slotId: payload.slotId,
    targetState: payload.targetState,
    expectedCurrentState: payload.expectedCurrentState
  });
});