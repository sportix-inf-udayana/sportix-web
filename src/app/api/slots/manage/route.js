import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuthAndCatch } from "../../../../lib/api-wrapper";
import { SLOT_STATUS } from "../../../../lib/constants";

const manageSlotSchema = z.object({
  slotId: z.string().uuid("ID Slot tidak valid"),
  targetState: z.enum([SLOT_STATUS.AVAILABLE, SLOT_STATUS.LOCKED, SLOT_STATUS.MAINTENANCE]),
  expectedCurrentState: z.string().optional()
});

async function patchSlotHandler(req, { supabase }) {
  const body = await req.json();
  const { slotId, targetState, expectedCurrentState } = manageSlotSchema.parse(body);

  const { data: slotInfo, error: slotErr } = await supabase
    .from("slots")
    .select("id, status, reservation_id, venues(owner_id)")
    .eq("id", slotId)
    .single();

  if (slotErr || !slotInfo) {
    return NextResponse.json({ success: false, message: "Akses properti ditolak." }, { status: 404 });
  }

  if (expectedCurrentState && slotInfo.status !== expectedCurrentState) {
    return NextResponse.json({ success: false, message: `Konflik. Slot diubah agen lain menjadi ${slotInfo.status}.` }, { status: 409 });
  }

  const isAvailable = targetState === SLOT_STATUS.AVAILABLE;
  
  // Object Spread untuk memperingkas pembuatan payload
  const updatePayload = {
    status: targetState,
    ...(isAvailable && { locked_until: null, reservation_id: null })
  };

  await supabase.from("slots").update(updatePayload).eq("id", slotId);

  // Otomatisasi pembatalan reservasi jika rilis paksa
  if (expectedCurrentState === 'BOOKED' && isAvailable && slotInfo.reservation_id) {
    await supabase.from("reservations").update({ status: 'CANCELLED_BY_ADMIN' }).eq("id", slotInfo.reservation_id);
  }

  return NextResponse.json({ success: true, message: `Status slot menjadi ${targetState}.` });
}

export const PATCH = withAuthAndCatch(patchSlotHandler);