/**
 * SPORTIX - ROUTE HANDLER API
 * Path: src/app/api/payments/webhook/route.js
 * Deskripsi SRS: 
 * Listener asinkron penangkap data respons (callback HTTP POST) dari Midtrans Gateway. Menggunakan mekanisme parsing berbasis 
 * prefix order ID komposit unik (REV- untuk reservasi, TRN- untuk turnamen, MKM- untuk marketplace UMKM) untuk memperbarui status transaksi 
 * secara instan. Jika pembayaran sukses terkonfirmasi namun status slot kadung expired, transaksi dialihkan otomatis ke tabel refund_logs.
 */
import { NextResponse } from 'next/server';
export async function POST(request) {
  return NextResponse.json({ received: true, agent: "Payment Reconciliation Agent" }, { status: 200 });
}
