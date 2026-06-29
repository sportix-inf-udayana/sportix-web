import React from "react";
import ScannerClient from "../../../../components/admin-venue/ScannerClient";

export const dynamic = 'force-dynamic';

export default async function ScannerPage() {
  return (
    <div className="w-full space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">QR Ticket Scanner</h1>
        <p className="text-sm text-brand-slate mt-1">
          Validasi kehadiran pengunjung secara real-time dan cegah manipulasi tiket.
        </p>
      </div>

      {/* Mesin Pemindai Sisi Klien */}
      <ScannerClient />
    </div>
  );
}