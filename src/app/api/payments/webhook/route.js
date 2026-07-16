// src/app/api/payments/webhook/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { BookingService } from '@/lib/services/booking.service';

export async function POST(req) {
  try {
    const payload = await req.json();
    const { order_id, status_code, gross_amount, signature_key } = payload;
    
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const hash = crypto.createHash('sha512').update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest('hex');

    if (hash !== signature_key) {
      console.warn('[WEBHOOK_FAIL] Invalid signature detection.');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await BookingService.handlePaymentWebhook(payload);
    
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('[WEBHOOK_ERROR]', error.message);
    return new NextResponse('Internal Error', { status: 500 });
  }
}