// src/app/api/slots/manage/route.js
import { NextResponse } from "next/server";
import { withAuthAndCatch } from "@/lib/api-wrapper";
import { AdminService } from "@/lib/services/admin.service";
import { manageSlotSchema } from "@/lib/validators/slot.validator";

async function patchSlotHandler(req, { supabase, user }) {
  const body = await req.json();
  
  // 1. Validasi Input (Zod harus dipisah ke file validator)
  const validatedData = manageSlotSchema.parse(body);

  // 2. Delegasikan ke Service Layer
  const result = await AdminService.updateSlotStatus({
    supabase,
    userId: user.id,
    ...validatedData
  });

  return NextResponse.json({ success: true, message: result.message });
}

export const PATCH = withAuthAndCatch(patchSlotHandler);