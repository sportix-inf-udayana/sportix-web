// src/app/api/scan/route.js
import { z } from "zod";
import { withAuthAndCatch, AppError } from "@/lib/api-wrapper";
import { ROLE, BOOKING_STATUS } from "@/lib/constants";

const scanSchema = z.object({
  barcodeToken: z.string().uuid()
});

export const POST = withAuthAndCatch(async (req, { supabase, user }) => {
  if (user.user_metadata?.role !== ROLE.ADMIN_VENUE) {
    throw new AppError("Forbidden. Khusus Operator Gate.", 403);
  }

  const { barcodeToken } = scanSchema.parse(await req.json());

  const { data: ticket, error } = await supabase
    .from("reservations")
    .select("id, status, users(full_name), venues(owner_id), fields(name)")
    .eq("id", barcodeToken)
    .single();

  if (error || !ticket || ticket.venues?.owner_id !== user.id) {
    throw new AppError("Karcis tidak valid atau bukan milik Venue Anda.", 404);
  }

  if (ticket.status !== BOOKING_STATUS.CONFIRMED) {
    throw new AppError(`Akses Ditolak. Status karcis: ${ticket.status}.`, 400);
  }

  await supabase
    .from("reservations")
    .update({ status: BOOKING_STATUS.CHECKED_IN })
    .eq("id", barcodeToken);

  return {
    message: "Karcis Berhasil Diverifikasi.",
    userName: ticket.users?.full_name || "Guest Athlete",
    fieldName: ticket.fields?.name || "Fasilitas Utama"
  };
});