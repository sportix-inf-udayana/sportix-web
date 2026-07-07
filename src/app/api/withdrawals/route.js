import { NextResponse } from "next/server";
import { withAuthAndCatch } from "../../../lib/api-wrapper";
import { ROLE } from "../../../lib/constants";

async function getWithdrawalsHandler(req, { supabase, user }) {
  let query = supabase.from("withdrawals").select("*, users(email)");
  
  // Jika bukan admin, hanya ambil milik sendiri
  if (user.user_metadata?.role !== ROLE.SUPER_ADMIN) {
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;

  return NextResponse.json({ success: true, data });
}

export const GET = withAuthAndCatch(getWithdrawalsHandler);