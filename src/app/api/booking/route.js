import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuthAndCatch } from "../../../lib/api-wrapper";
import { SLOT_STATUS } from "../../../lib/constants";

// DTO Validation Schema
const bookingSchema = z.object({
  slotId: z.string().uuid("ID Slot harus berupa UUID valid"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM")
});

async function bookingHandler(request, { supabase, user }) {
  const body = await request.json();
  
  // Validasi ketat akan melempar ZodError jika payload anomali, langsung ditangkap oleh api-wrapper
  const { slotId, date, time } = bookingSchema.parse(body);

  // Re-entrant Lock Mechanism dengan Konstanta
  const { data: slot, error: lockError } = await supabase
    .from("slots")
    .update({ status: SLOT_STATUS.LOCKED })
    .eq("id", slotId)
    .eq("status", SLOT_STATUS.AVAILABLE) // Hanya kunci jika masih available
    .select()
    .single();

  if (lockError || !slot) {
    return NextResponse.json({ success: false, message: "Slot sudah tidak tersedia atau sedang dikunci" }, { status: 409 });
  }

  // Persiapan transaksi Midtrans (Gunakan ENV, dilarang hardcode URL Sandbox)
  const MIDTRANS_URL = process.env.MIDTRANS_API_URL || "https://app.sandbox.midtrans.com/snap/v1/transactions";
  const serverKey = Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64");

  const transactionData = {
    transaction_details: {
      order_id: `TRX-${slotId}-${Date.now()}`,
      gross_amount: slot.price
    },
    customer_details: {
      first_name: user.user_metadata?.full_name || "Customer",
      email: user.email
    }
  };

  const midtransResponse = await fetch(MIDTRANS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${serverKey}`
    },
    body: JSON.stringify(transactionData)
  });

  if (!midtransResponse.ok) {
    // Release Lock jika gateway gagal
    await supabase.from("slots").update({ status: SLOT_STATUS.AVAILABLE }).eq("id", slotId);
    return NextResponse.json({ success: false, message: "Kegagalan Payment Gateway" }, { status: 502 });
  }

  const midtransResult = await midtransResponse.json();

  return NextResponse.json({ 
    success: true, 
    token: midtransResult.token,
    redirect_url: midtransResult.redirect_url 
  });
}

// Bungkus dengan High-Order Function untuk otomatisasi Auth & Error Handling
export const POST = withAuthAndCatch(bookingHandler);