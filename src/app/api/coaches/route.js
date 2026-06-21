/**
 * SPORTIX - ROUTE HANDLER API
 * Path: src/app/api/coaches/route.js
 * Deskripsi SRS: 
 * Gerbang data operasi (CRUD) profil pelatih. Mengatur kueri filter spesialisasi cabang olahraga, pembaruan rating dari customer, 
 * pendaftaran jadwal mengajar ke tabel relasional coach_bookings, serta memproses otomatisasi penalti pemotongan saldo jika pelatih melakukan pembatalan sepihak.
 */
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ data: [] }); }
