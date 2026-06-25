import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";

// Memastikan Next.js tidak melakukan caching pada endpoint ini
export const dynamic = 'force-dynamic';

export async function GET(request) {
  // 1. Proteksi Otorisasi Infrastruktur
  // Endpoint ini tidak boleh bisa di-hit oleh publik secara serampangan
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse(JSON.stringify({ error: "Akses Ditolak. Otorisasi Cron gagal." }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return new NextResponse(JSON.stringify({ error: "Fatal: Database tidak merespons." }), { 
      status: 503,
      headers: { "Content-Type": "application/json" } 
    });
  }

  try {
    const nowISO = new Date().toISOString();

    // ============================================================================
    // AGEN 1: SLOT LOCKING SWEEPER (SLA)
    // Merilis slot yang di-booking tapi tidak dibayar setelah batas waktu 15 menit
    // ============================================================================
    const { data: expiredLocks, error: sweepError } = await supabase
      .from('slots')
      .update({ status: 'AVAILABLE', locked_until: null, reservation_id: null })
      .eq('status', 'LOCKED')
      .lt('locked_until', nowISO)
      .select('id, reservation_id');

    if (sweepError) throw sweepError;

    // Batalkan juga status reservasi terkait menjadi EXPIRED jika payment telat
    if (expiredLocks && expiredLocks.length > 0) {
      const reservationIds = expiredLocks.map(slot => slot.reservation_id).filter(Boolean);
      if (reservationIds.length > 0) {
        await supabase
          .from('reservations')
          .update({ status: 'EXPIRED' })
          .in('id', reservationIds)
          .eq('status', 'PENDING');
      }
    }

    // ============================================================================
    // AGEN 2: FORFEIT ENFORCEMENT AGENT (FEA) - STRICT 15 MIN POLICY
    // Eksekusi sanksi pembatalan otomatis dan sita dana 100% jika telat check-in
    // ============================================================================
    // Catatan: Ini memanggil fungsi RPC yang sudah Anda definisikan di Supabase
    // untuk melakukan kalkulasi zona waktu WITA dengan presisi di level fisik database.
    const { data: forfeitedData, error: forfeitError } = await supabase
      .rpc('enforce_strict_forfeits', { current_utc_time: nowISO });

    if (forfeitError) {
      console.error("FEA Execution Failed:", forfeitError);
      // Kami tidak melakukan throw di sini agar proses pelaporan di bawah tetap berjalan
    }

    return new NextResponse(JSON.stringify({
      success: true,
      message: "Autonomous Agents (SLA & FEA) executed successfully.",
      sweptSlotsCount: expiredLocks?.length || 0,
      timestamp: nowISO
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("CRON JOB PANIC:", error);
    return new NextResponse(JSON.stringify({ 
      success: false, 
      message: "Kegagalan sistem otonom backend.", 
      error: error.message 
    }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}