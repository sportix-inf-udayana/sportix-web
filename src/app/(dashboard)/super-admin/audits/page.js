import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { getGlobalFinancialMetrics } from "@/lib/services/admin.service";
import FinancialMetricsCards from "@/components/super-admin/FinancialMetricsCards";
import LedgerStreamTable from "@/components/super-admin/LedgerStreamTable";

export const dynamic = 'force-dynamic';

export default async function SuperAdminAuditsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) redirect("/login");
  
  if (user.user_metadata?.role !== 'SUPER_ADMIN') {
    return <div className="p-8 text-red-500 font-mono text-center bg-zinc-950">Forbidden. Khusus Super Admin.</div>;
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
        <h1 className="text-2xl font-black text-white font-display uppercase tracking-tight">Global Financial Audit</h1>
        <p className="text-zinc-400 text-xs md:text-sm mt-1">
          Data disinkronisasi secara real-time dari tabel <code className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono text-xs">ledger_transactions</code>. 
          Modul ini menolak cache untuk menjamin presisi akuntansi absolut.
        </p>
      </div>

      <FinancialMetricsCards metrics={metrics} />
      <LedgerStreamTable streamData={metrics.ledgerStream} />
    </div>
  );
}