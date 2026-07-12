// src/app/api/payments/webhook/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { BookingService } from '@/lib/services/booking.service';

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const headers = Object.fromEntries(req.headers);
    const signature = headers['x-payment-signature'];

    // 1. Verifikasi Kriptografi (Contoh HMAC SHA256)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('[Webhook] Invalid signature detected.');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // 2. Lempar ke Service dengan Idempotency Key (misal: transaction_id)
    await BookingService.handlePaymentWebhook(payload);

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('[Webhook Error]', error.message);
    // Jangan pernah mengembalikan detail error ke webhook provider
    return new NextResponse('Internal Error', { status: 500 });
  }
}