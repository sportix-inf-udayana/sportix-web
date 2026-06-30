"use client";

import React, { useState, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, AlertCircle, Grid, ShieldAlert, Check } from "lucide-react";

export default function SlotMatrixClient({ initialSlots, venueId }) {
  const [slots, setSlots] = useState(initialSlots || []);
  const [updatingId, setUpdatingId] = useState(null);
  const [globalError, setGlobalError] = useState(null);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), []);

  const handleToggleSlotStatus = async (slotId, currentStatus) => {
    setUpdatingId(slotId);
    setGlobalError(null);

    // Tentukan target perubahan status matriks operasional
    const targetState = currentStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";

    try {
      // FIX CORE LUBANG JARINGAN: Tarik token akses aktif dari session storage browser secara aman
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Sesi otorisasi Anda telah berakhir. Silakan lakukan login ulang.");
      }

      const response = await fetch("/api/slots/manage", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          slotId: slotId,
          targetState: targetState,
          expectedCurrentState: currentStatus
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memperbarui status matriks slot sewa.");
      }

      // Perbarui kondisi state lokal secara optimistik setelah disetujui server
      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, status: targetState } : s));

    } catch (err) {
      console.error(err);
      setGlobalError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans text-white">
      {globalError && (
        <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 font-mono text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>NETWORK_GATEWAY_INTERRUPTION: {globalError}</span>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
          <Grid className="w-5 h-5 text-brand-neon" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider">Matriks Kontrol Jam Operasional</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {slots.map((slot) => {
            const isAvailable = slot.status === "AVAILABLE";
            const isBooked = slot.status === "BOOKED";
            const isLocked = slot.status === "LOCKED";
            const isLoading = updatingId === slot.id;

            return (
              <button
                key={slot.id}
                disabled={isBooked || isLocked || isLoading}
                onClick={() => handleToggleSlotStatus(slot.id, slot.status)}
                className={`p-4 rounded-xl border flex flex-col justify-between h-24 text-left font-mono transition-all duration-200 relative group
                  ${isAvailable 
                    ? 'bg-zinc-950 border-zinc-800 hover:border-brand-neon cursor-pointer' 
                    : isBooked 
                    ? 'bg-zinc-900/40 border-red-500/20 text-red-400/60 cursor-not-allowed'
                    : isLocked
                    ? 'bg-zinc-900/40 border-amber-500/20 text-amber-400/60 cursor-not-allowed'
                    : 'bg-zinc-900 border-zinc-800/50 text-zinc-600 hover:border-zinc-700 cursor-pointer'
                  }`}
              >
                <span className="text-xs font-bold text-white block">{slot.start_time}</span>
                
                <div className="flex items-center justify-between w-full mt-2">
                  <span className="text-micro block tracking-tighter uppercase">
                    {slot.status}
                  </span>
                  {isLoading && <Loader2 className="w-3 h-3 animate-spin text-brand-neon" />}
                  {isBooked && <ShieldAlert className="w-3.5 h-3.5 text-red-400" />}
                </div>

                {isAvailable && (
                  <div className="absolute inset-0 bg-brand-neon/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}