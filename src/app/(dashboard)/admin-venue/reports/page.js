import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { BarChart3, TrendingUp, AlertOctagon } from "lucide-react";

// Path relatif murni sesuai arsitektur Clean Code
import { getVenueReports } from "../../../../lib/services/admin.service";
import AdminVenueHeader from "../../../../components/admin-venue/AdminVenueHeader";

export const dynamic = 'force-dynamic';

export default async function AdminVenueReportsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return <div className="p-8 text-red-500 font-mono">Fatal: Sesi tidak valid. Akses Ditolak.</div>;
  }

  // Eksekusi Data Layer Terpusat
  const { venue, reports, totals, error: venueError } = await getVenueReports(supabase, user.id);

  if (venueError || !venue) {
    return (
      <div className="max-w-7xl mx-auto px-6 mt-8 border border-brand-amber/30 bg-brand-amber/10 p-6 rounded-xl">
        <h3 className="text-brand-amber font-bold flex items-center gap-2">
          <AlertOctagon className="w-5 h-5" /> Venue Tidak Ditemukan
        </h3>
        <p className="text-zinc-400 text-sm mt-2">
          Akun Anda belum dikaitkan dengan entitas venue manapun, atau masih berstatus PENDING validasi Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans select-none">
      {/* Penggunaan Header Komponen Eksternal */}
      <AdminVenueHeader venueName={venue.name} />

      <div className="max-w-7xl mx-auto px-6 mt-8 font-sans">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-brand-emerald" /> Laporan Pendapatan Otonom
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Sistem Analytics Reporting Agent (ARA) memperbarui pembukuan ini secara otomatis melalui asinkronisasi harian.
          </p>
        </div>

        {/* Kartu Ringkasan (Statis di Render Server) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface-elevated border border-zinc-800 p-6 rounded-2xl">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block mb-2">Total Operasional (30 Hari)</span>
            <span className="text-3xl font-display font-bold text-white tracking-tight">
              Rp {totals.revenue.toLocaleString("id-ID")}
            </span>
          </div>
          
          <div className="bg-surface-elevated border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-16 h-16 text-brand-emerald" />
            </div>
            <span className="text-xs font-mono text-brand-emerald uppercase tracking-widest block mb-2 font-bold">
              Pendapatan Hangus (Forfeit)
            </span>
            <span className="text-3xl font-display font-bold text-brand-neon tracking-tight">
              Rp {totals.forfeit.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="bg-surface-elevated border border-zinc-800 p-6 rounded-2xl">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block mb-2">Total No-Show Pelanggan</span>
            <span className="text-3xl font-display font-bold text-brand-amber tracking-tight">
              {totals.noShows} <span className="text-sm font-normal text-zinc-500 font-sans">Pelanggaran</span>
            </span>
          </div>
        </div>

        {/* Tabel Laporan Riwayat */}
        <div className="bg-surface border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-surface-elevated">
            <h3 className="font-bold text-white font-display">Buku Besar Harian (Ledger Log)</h3>
            <span className="text-xs bg-brand-emerald/10 text-brand-emerald px-3 py-1 rounded-full border border-brand-emerald/20 font-mono">
              VERIFIED
            </span>
          </div>
          
          {reports && reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-900/50 font-mono text-xs uppercase border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Tanggal (WITA)</th>
                    <th className="px-6 py-4">Sewa Terselesaikan</th>
                    <th className="px-6 py-4">Pendapatan Sewa</th>
                    <th className="px-6 py-4 text-brand-amber">Insiden No-Show</th>
                    <th className="px-6 py-4 text-brand-emerald">Sita Dana (Forfeit)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {reports.map((row) => (
                    <tr key={row.id} className="hover:bg-surface-elevated transition-colors">
                      <td className="px-6 py-4 font-mono text-white">{row.report_date}</td>
                      <td className="px-6 py-4">{row.total_bookings} Transaksi</td>
                      <td className="px-6 py-4 font-mono">Rp {Number(row.operational_revenue).toLocaleString("id-ID")}</td>
                      <td className="px-6 py-4 text-brand-amber font-bold">{row.total_no_shows}</td>
                      <td className="px-6 py-4 font-mono text-brand-neon font-bold">
                        Rp {Number(row.forfeited_revenue).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                <BarChart3 className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm">Belum ada agregasi laporan untuk venue ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}