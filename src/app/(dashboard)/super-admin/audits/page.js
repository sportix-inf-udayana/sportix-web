import React from "react";
import { cookies } from "next/headers";
import { getSupabaseUser } from "../../../../lib/supabase";
import { getGlobalFinancialMetrics } from "../../../../lib/services/admin.service";
import FinancialMetricsCards from "../../../../components/super-admin/FinancialMetricsCards";
import LedgerStreamTable from "../../../../components/super-admin/LedgerStreamTable";

export const dynamic = 'force-dynamic';

export default async function SuperAdminAuditsPage() {
  const cookieStore = cookies();
  
  const allCookies = cookieStore.getAll();
  const authCookie = allCookies.find(c => c.name.includes("auth-token"));
  const token = authCookie ? authCookie.value : "";
  
  const supabase = getSupabaseUser(token);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return <div className="p-8 text-red-500 font-mono text-center">Akses Ditolak. (Missing JWT)</div>;
  
  if (user.user_metadata?.role !== 'SUPER_ADMIN') {
    return <div className="p-8 text-red-500 font-mono text-center">Forbidden. Khusus Super Admin.</div>;
  }

  const metrics = await getGlobalFinancialMetrics(supabase) || { 
    integrityMismatch: 0, 
    forfeitedCount: 0, 
    unprocessedRefundsCount: 0, 
    totalVolume: 0, 
    ledgerStream: [] 
  };

  return (
    <div className="w-full space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-black text-white font-display">Global Financial Audit</h1>
        <p className="text-zinc-400 text-xs md:text-sm mt-1">
          Data disinkronisasi secara real-time dari tabel <code className="bg-zinc-800 px-1 rounded">ledger_transactions</code>. 
          Modul ini menolak cache untuk menjamin presisi akuntansi absolut.
        </p>
      </div>

      <FinancialMetricsCards metrics={metrics} />
      <LedgerStreamTable streamData={metrics.ledgerStream} />
    </div>
  );
}