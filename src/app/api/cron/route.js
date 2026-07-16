// src/app/api/cron/route.js
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { BOOKING_STATUS, SLOT_STATUS, BUSINESS_RULES, TRANSACTION_TYPE } from "@/lib/constants";

export async function GET(request) {
  if (request.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, message: "Unauthorized. Invalid Signature." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();
  const slaThreshold = new Date(now.getTime() - BUSINESS_RULES.SLA_LOCK_MINUTES * 60000).toISOString();

  try {
    // 1. SLA: 15-Minute Transactional Lock Cleanup
    const { data: staleReservations } = await supabase
      .from("reservations")
      .select("id")
      .eq("status", BOOKING_STATUS.PENDING)
      .lt("created_at", slaThreshold);

    if (staleReservations?.length > 0) {
      const staleIds = staleReservations.map(r => r.id);
      await Promise.all([
        supabase
          .from("venue_slots")
          .update({ status: SLOT_STATUS.AVAILABLE, is_available: true, reservation_id: null, locked_until: null, locked_by: null })
          .in("reservation_id", staleIds)
          .eq("status", SLOT_STATUS.LOCKED),
        supabase
          .from("reservations")
          .update({ status: BOOKING_STATUS.CANCELLED_BY_ADMIN, notes: "SLA: Dibatalkan otomatis (Timeout Gateway)" })
          .in("id", staleIds)
      ]);
    }

    // 2. FEA: Forfeit Enforcement (Over 15 minutes late)
    const today = now.toISOString().split('T')[0];
    
    const { data: activeReservations } = await supabase
      .from("reservations")
      .select(`
        id, total_price,
        venues(owner_id),
        venue_slots!inner(slot_date, start_time)
      `)
      .eq("status", BOOKING_STATUS.CONFIRMED)
      .lte("venue_slots.slot_date", today);

    if (activeReservations?.length > 0) {
      const forfeitIds = [];
      const ledgerEntries = [];

      for (const res of activeReservations) {
        const earliestSlot = res.venue_slots.sort((a, b) => a.start_time.localeCompare(b.start_time))[0];
        const slotDateTime = new Date(`${earliestSlot.slot_date}T${earliestSlot.start_time}Z`);
        const feaThreshold = new Date(slotDateTime.getTime() + BUSINESS_RULES.FEA_TOLERANCE_MINUTES * 60000);

        if (now > feaThreshold) {
          forfeitIds.push(res.id);
          const ownerId = res.venues.owner_id;

          const { data: ownerBalance } = await supabase.from('balances').select('amount').eq('user_id', ownerId).single();
          await supabase.from('balances').update({ amount: Number(ownerBalance?.amount || 0) + Number(res.total_price) }).eq('user_id', ownerId);

          ledgerEntries.push({
            user_id: ownerId,
            transaction_type: TRANSACTION_TYPE.CREDIT,
            source: `FEA_SEIZURE_REV-${res.id}`,
            amount: res.total_price
          });
        }
      }

      if (forfeitIds.length > 0) {
        await Promise.all([
          supabase.from("reservations").update({ status: BOOKING_STATUS.FORFEITED, notes: "FEA: No-show 15m penalty." }).in("id", forfeitIds),
          supabase.from("venue_slots").update({ status: SLOT_STATUS.AVAILABLE, is_available: true, reservation_id: null, locked_until: null, locked_by: null }).in("reservation_id", forfeitIds),
          supabase.from("ledger_transactions").insert(ledgerEntries)
        ]);
      }
    }

    return NextResponse.json({ success: true, message: "Autonomous SLA & FEA sweeps completed." });
  } catch (error) {
    console.error("[CRON ERROR]:", error);
    return NextResponse.json({ success: false, message: "Kegagalan Database." }, { status: 500 });
  }
}