import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuthAndCatch } from "../../../lib/api-wrapper";
import { SLOT_STATUS } from "../../../lib/constants";

const bookingSchema = z.object({
  slotId: z.string().uuid("ID Slot harus berupa UUID valid"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM")
});

const MIDTRANS_URL = process.env.MIDTRANS_API_URL || "https://app.sandbox.midtrans.com/snap/v1/transactions";
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ? Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64") : "";

// Helper terpisah untuk isolasi logika API eksternal
async function createMidtransTransaction(orderId, amount, user) {
  const response = await fetch(MIDTRANS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${SERVER_KEY}`
    },
    body: JSON.stringify({
      transaction_details: { order_id: orderId, gross_amount: amount },
      customer_details: {
        first_name: user.user_metadata?.full_name || "Customer",
        email: user.email
      }
    })
  });

  if (!response.ok) throw new Error("Kegagalan API Midtrans");
  return response.json();
}

async function bookingHandler(request, { supabase, user }) {
  const body = await request.json();
  const { slotId } = bookingSchema.parse(body);

  // 1. Lock database (Ubah status slot menjadi terkunci)
  const { data: slot, error: lockError } = await supabase
    .from("slots")
    .update({ status: SLOT_STATUS.LOCKED })
    .eq("id", slotId)
    .eq("status", SLOT_STATUS.AVAILABLE)
    .select()
    .single();

  if (lockError || !slot) {
    return NextResponse.json({ success: false, message: "Slot sudah tidak tersedia atau sedang dikunci" }, { status: 409 });
  }

  // 2. Eksekusi Payment Gateway
  try {
    const orderId = `TRX-${slotId}-${Date.now()}`;
    const midtransResult = await createMidtransTransaction(orderId, slot.price, user);

    return NextResponse.json({ 
      success: true, 
      token: midtransResult.token,
      redirect_url: midtransResult.redirect_url 
    });
  } catch (error) {
    // Rollback DB jika payment API gagal
    await supabase.from("slots").update({ status: SLOT_STATUS.AVAILABLE }).eq("id", slotId);
    return NextResponse.json({ success: false, message: "Kegagalan Payment Gateway" }, { status: 502 });
  }
}

export const POST = withAuthAndCatch(bookingHandler);