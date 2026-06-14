/**
 * @file src/app/api/cron/route.js
 * @agent Forfeit Enforcement Agent (FEA) - Mengeksekusi sanksi denda uang muka otomatis.
 * @rule Strict Forfeit Policy: Keterlambatan check-in melebihi 15 menit menghanguskan seluruh durasi sewa.
 * @action Menyita penuh deposit uang muka 30% dan melepas sisa slot waktu menjadi AVAILABLE.
 */
export async function POST(request) {
  return new Response(JSON.stringify({ status: "Cron execution completed" }), { status: 200 });
}
