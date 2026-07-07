import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuthAndCatch } from "../../../lib/api-wrapper";
import { ROLE } from "../../../lib/constants";

// Proteksi injeksi Token Scanner
const scanSchema = z.object({
  barcodeToken: z.string().uuid("Format Token Barcode tidak valid")
});

async function scanHandler(req, { supabase, user }) {
  if (user.user_metadata?.role !== ROLE.ADMIN_VENUE) {
    return NextResponse.json({ success: false, message: "Akses Ditolak. Khusus Operator Gate." }, { status: 403 });
  }

  const body = await req.json();
  const { barcodeToken } = scanSchema.parse(body);

  // Verifikasi relasi: Tiket harus milik venue yang dikelola user.id ini
  const { data: ticket, error } = await supabase
    .from("reservations")
    .select(`id, status, users ( full_name ), fields ( name, venues ( owner_id ) )`)
    .eq("id", barcodeToken)
    .single();

  if (error || !ticket || ticket.fields.venues.owner_id !== user.id) {
    return NextResponse.json({ success: false, message: "Karcis tidak valid atau bukan milik Venue Anda." }, { status: 404 });
  }

  if (ticket.status !== 'CONFIRMED') {
    return NextResponse.json({ success: false, message: `Akses Ditolak. Status karcis: ${ticket.status}.` }, { status: 400 });
  }

  // Tandai tiket hangus (telah digunakan / check-in)
  await supabase.from("reservations").update({ status: 'COMPLETED' }).eq("id", barcodeToken);

  return NextResponse.json({
    success: true,
    message: `Karcis Berhasil Diverifikasi.`,
    userName: ticket.users?.full_name || "Guest Athlete",
    fieldName: ticket.fields?.name || "Fasilitas Utama"
  });
}

export const POST = withAuthAndCatch(scanHandler);