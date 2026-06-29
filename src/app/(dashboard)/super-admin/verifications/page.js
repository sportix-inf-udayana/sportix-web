import React from "react";
import VerificationClient from "../../../../components/super-admin/VerificationClient";

export const dynamic = 'force-dynamic';

export default async function SuperAdminVerificationsPage() {
  return (
    <div className="w-full space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Verifikasi Kepatuhan Arena</h1>
        <p className="text-sm text-brand-slate mt-1">
          Tinjau pendaftaran fasilitas olahraga baru. Hanya arena yang disetujui yang akan masuk ke buku besar sistem.
        </p>
      </div>

      <VerificationClient />
    </div>
  );
}