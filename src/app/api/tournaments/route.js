import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuthAndCatch } from "../../../lib/api-wrapper";

const tournamentSchema = z.object({
  tournamentId: z.string().uuid("ID Turnamen tidak valid"),
  teamName: z.string().min(3, "Nama tim minimal 3 karakter")
});

async function tournamentHandler(req, { supabase, user }) {
  const body = await req.json();
  const { tournamentId, teamName } = tournamentSchema.parse(body);

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
}

export const POST = withAuthAndCatch(tournamentHandler);