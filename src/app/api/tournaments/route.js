import { NextResponse } from "next/server";
import { getSupabaseUser } from "../../../lib/supabase";

export async function POST(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    if (!token) return NextResponse.json({ success: false, message: "Missing Token" }, { status: 401 });

    // FIX: Penegakan enkapsulasi otentikasi lapis dasar
    const supabase = getSupabaseUser(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { tournamentId, teamName } = body;

    if (!tournamentId || !teamName) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const { data: registration, error: insertErr } = await supabase
      .from("tournament_registrations")
      .insert({
        user_id: user.id,
        tournament_id: tournamentId,
        team_name: teamName.trim(),
        status: "PENDING",
        payment_status: "PENDING"
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error("Tournament API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}