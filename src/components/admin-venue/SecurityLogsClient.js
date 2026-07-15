"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, Loader2, Activity, Terminal } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getSupabase } from "@/lib/supabase";

const cn = (...inputs) => twMerge(clsx(inputs));

export default function SecurityLogsClient() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = getSupabase();

  useEffect(() => {
    let isMounted = true;

    const fetchLogs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Akses ditolak.");

        // NOTE: Dalam implementasi riil, ini akan melakukan query ke tabel 'audit_logs' atau 'security_events'
        // Mock data digunakan di sini untuk merepresentasikan immutable ledger log
        const mockLogs = [
          { id: 'sec-1', event: 'SLOT_MUTATION', timestamp: new Date().toISOString(), status: 'AUTHORIZED', ip: '103.119.144.12' },
          { id: 'sec-2', event: 'SLA_FORFEITURE_TRIGGER', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'SYSTEM_AUTO', ip: 'internal-cron' },
          { id: 'sec-3', event: 'INVALID_TOKEN_SIGNATURE', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'BLOCKED', ip: '192.168.1.105' },
          { id: 'sec-4', event: 'ADMIN_LOGIN_SUCCESS', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'AUTHORIZED', ip: '103.119.144.12' },
        ];

        // Simulasi latensi jaringan
        setTimeout(() => {
          if (isMounted) setLogs(mockLogs);
          if (isMounted) setLoading(false);
        }, 800);

      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchLogs();

    return () => { isMounted = false; };
  }, [supabase]);

  return (
    <div className="space-y-6 w-full text-white font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display uppercase">Access & Security Logs</h1>
          <p className="text-zinc-500 text-xs font-mono mt-1">Sistem pemantauan integritas akses level-venue.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">System Active</span>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-mono">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>SECURITY_ERROR: {error}</span>
        </div>
      )}

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-500" />
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Immutable Event Stream</span>
        </div>
        
        {loading ? (
          <div className="h-48 flex flex-col items-center justify-center gap-3">
             <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
             <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500">Retrieving Logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center gap-3 bg-zinc-900/20">
             <ShieldCheck className="w-8 h-8 text-zinc-700" />
             <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500">NO RECENT INCIDENTS</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-500">
                <tr>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider">Timestamp (WITA)</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider">Event Signature</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider">IP / Origin</th>
                  <th className="px-6 py-3 font-semibold uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-300">
                      {log.event}
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {log.ip}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase border tracking-widest inline-block",
                        log.status === "AUTHORIZED" || log.status === "SYSTEM_AUTO"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      )}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}