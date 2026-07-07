import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuthAndCatch } from "../../../lib/api-wrapper";

const tournamentSchema = z.object({
  tournamentId: z.string().uuid(),
  teamName: z.string().min(3)
});

async function tournamentHandler(req, { supabase, user }) {
  const body = await req.json();
  const { tournamentId, teamName } = tournamentSchema.parse(body);

  const { data: registration, error } = await supabase
    .from("tournament_registrations")
    .insert({
      tournament_id: tournamentId,
      user_id: user.id,
      team_name: teamName,
      status: "PENDING",
      payment_status: "UNPAID"
    })
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({ success: true, registrationId: registration.id });
}

export const POST = withAuthAndCatch(tournamentHandler);