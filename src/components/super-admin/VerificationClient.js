"use client";

import React, { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Check, X, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

// Inisiasi Supabase di luar komponen utama
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function VerificationClient({ initialItems }) {
  const [items, setItems] = useState(initialItems || []);
  const [processingId, setProcessingId] = useState(null);
  const [networkError, setNetworkError] = useState(null);

  const handleAuditAction = async (entityId, entityType, action) => {
    setProcessingId(entityId);
    setNetworkError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Sesi administratif kedaluwarsa. Silakan masuk kembali.");
      }

      const response = await fetch("/api/verifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ entityId, entityType, action })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Gagal memperbarui status verifikasi mitra.");

      setItems(prev => prev.filter(item => item.id !== entityId));
    } catch (err) {
      console.error(err);
      setNetworkError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans text-white">
      {networkError && (
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 font-mono text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>VERIFICATION_GATEWAY_ERROR: {networkError}</span>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
          <ShieldCheck className="w-5 h-5 text-red-400" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider">Antrean Onboarding Mitra Regional</h3>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg text-zinc-500 text-xs font-mono">
            TIDAK ADA ENTITAS DALAM ANTRIAN AUDIT BERKAS
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {items.map((entity) => (
              <div key={entity.id} className="py-4 flex flex-col sm:flex-row justify-between items-center gap-4 first:pt-0 last:pb-0">
                <div className="text-left w-full sm:w-auto">
                  <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase block w-max mb-1">
                    {entity.type || "VENUE"}
                  </span>
                  <h4 className="text-sm font-bold text-white">{entity.name}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">{entity.address || "No Address Provided"}</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    disabled={processingId === entity.id}
                    onClick={() => handleAuditAction(entity.id, entity.type || "VENUE", "REJECT")}
                    className="p-2 rounded-lg border border-zinc-800 hover:border-red-500/30 text-zinc-400 hover:text-red-400 bg-zinc-950 transition-all cursor-pointer disabled:opacity-40"
                    title="Tolak Kemitraan"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    disabled={processingId === entity.id}
                    onClick={() => handleAuditAction(entity.id, entity.type || "VENUE", "APPROVE")}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                  >
                    {processingId === entity.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>SETUJUI</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}