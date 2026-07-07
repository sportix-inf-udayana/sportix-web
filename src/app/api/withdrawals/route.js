import { NextResponse } from "next/server";
import { withAuthAndCatch } from "../../../lib/api-wrapper";
import { ROLE } from "../../../lib/constants";

async function getWithdrawalsHandler(req, { supabase, user }) {
  const role = user.user_metadata?.role;
  let query = supabase.from("withdrawal_logs").select("*");

  if (role === ROLE.SUPER_ADMIN) {
    // Pusat kontrol melihat semua histori
    query = query.order("created_at", { ascending: false });
  } else if (role === ROLE.COACH || role === ROLE.ADMIN_VENUE) {
    // Entitas mitra dibatasi RLS secara otonom, tapi kita pertegas relasinya
    query = query.eq("user_id", user.id).order("created_at", { ascending: false });
  } else {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const { data: logs, error } = await query;
  if (error) throw error;

  return NextResponse.json({ success: true, data: logs || [] });
}

export const GET = withAuthAndCatch(getWithdrawalsHandler);