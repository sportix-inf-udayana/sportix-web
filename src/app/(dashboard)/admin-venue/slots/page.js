import React from "react";
import SlotMatrixClient from "../../../../components/admin-venue/SlotMatrixClient";

export const dynamic = 'force-dynamic';

export default async function AdminVenueSlotsPage() {
  return (
    <div className="w-full space-y-6">
      
      {/* Judul Halaman Internal */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Slot Matrix Management</h1>
        <p className="text-sm text-brand-slate mt-1">
          Pantau ketersediaan lapangan, kelola status operasional, dan awasi transaksi secara real-time.
        </p>
      </div>

      {/* Komponen Interaktif Pengelola Slot */}
      <SlotMatrixClient />
      
    </div>
  );
}