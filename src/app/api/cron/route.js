/**
 * SPORTIX - ROUTE HANDLER API
 * Path: src/app/api/cron/route.js
 * Deskripsi SRS: 
 * Endpoint otomatisasi serverless (Vercel Cron Jobs) yang dipicu sistem secara periodik setiap 1 menit. Mengeksekusi fungsi otonom 
 * Forfeit Enforcement Agent (FEA) untuk menjaring transaksi no-show (customer terlambat hadir > 15 menit dari jam booking pertama), 
 * menyita dana sewa 100% masuk kas pendapatan bersih venue, dan mengembalikan slot sisa jam sewa tersebut ke status AVAILABLE.
 */
import { NextResponse } from 'next/server';
export async function POST(request) {
  return NextResponse.json({ triggered: true, agent: "Forfeit Enforcement Agent" }, { status: 200 });
}
