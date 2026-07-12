"use client";

import React, { useState, useCallback, useEffect, memo } from "react";
import { Loader2, AlertCircle, Grid, ShieldAlert, CalendarDays, Map } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

// 1. ISOLASI & MEMOIZATION KOMPONEN ANAK
const MatrixCell = memo(({ slot, isUpdating, onToggle }) => {
  const isAvailable = slot.status === "AVAILABLE";
  const isBooked = slot.status === "BOOKED";
  const isLocked = slot.status === "LOCKED";

  const handleClick = useCallback(() => {
    onToggle(slot.id, slot.status);
  }, [slot.id, slot.status, onToggle]);

  return (
    <button
      disabled={isBooked || isLocked || isUpdating}
      onClick={handleClick}
      className={cn(
        "p-4 rounded-xl border flex flex-col justify-between h-24 text-left font-mono transition-all duration-200 relative group",
        isAvailable && "bg-zinc-950 border-zinc-800 hover:border-brand-neon cursor-pointer",
        isBooked && "bg-zinc-900/40 border-red-500/20 text-red-400/60 cursor-not-allowed",
        isLocked && "bg-zinc-900/40 border-amber-500/20 text-amber-400/60 cursor-not-allowed",
        (!isAvailable && !isBooked && !isLocked) && "bg-zinc-900 border-zinc-800/50 text-zinc-600 hover:border-zinc-700 cursor-pointer"
      )}
    >
      <span className="text-xs font-bold text-white block">{slot.start_time}</span>
      
      <div className="flex items-center justify-between w-full mt-2">
        <span className="text-[10px] block tracking-tighter uppercase">{slot.status}</span>
        {isUpdating && <Loader2 className="w-3 h-3 animate-spin text-brand-neon" />}
        {isBooked && <ShieldAlert className="w-3.5 h-3.5 text-red-400" />}
      </div>

      {isAvailable && (
        <div className="absolute inset-0 bg-brand-neon/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity pointer-events-none" />
      )}
    </button>
  );
});

MatrixCell.displayName = "MatrixCell";

// 2. MAIN COMPONENT DENGAN STATE MANAGEMENT YANG BENAR
export default function SlotMatrixClient({ initialFields, accessToken }) {
  // UI States
  const [selectedFieldId, setSelectedFieldId] = useState(initialFields?.[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Data States
  const [slots, setSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [globalError, setGlobalError] = useState(null);

  // 3. FETCHING LOGIC BERDASARKAN FILTER
  useEffect(() => {
    if (!selectedFieldId || !selectedDate || !accessToken) return;

    let isMounted = true;
    const fetchMatrix = async () => {
      setIsLoadingSlots(true);
      setGlobalError(null);
      
      try {
        // Asumsi kamu memiliki endpoint GET /api/slots?fieldId=...&date=...
        const response = await fetch(`/api/slots?fieldId=${selectedFieldId}&date=${selectedDate}`, {
          headers: { "Authorization": `Bearer ${accessToken}` }
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Gagal memuat matriks.");
        
        if (isMounted) setSlots(result.data || []);
      } catch (err) {
        if (isMounted) setGlobalError(err.message);
      } finally {
        if (isMounted) setIsLoadingSlots(false);
      }
    };

    fetchMatrix();

    return () => { isMounted = false; };
  }, [selectedFieldId, selectedDate, accessToken]);

  // 4. UPDATE LOGIC (Optimized with useCallback)
  const handleToggleSlotStatus = useCallback(async (slotId, currentStatus) => {
    setUpdatingId(slotId);
    setGlobalError(null);

    const targetState = currentStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";

    try {
      const response = await fetch("/api/slots/manage", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ slotId, targetState, expectedCurrentState: currentStatus })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal memperbarui status matriks.");

      // Optimistic UI update
      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, status: targetState } : s));
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }, [accessToken]); // Hanya bergantung pada accessToken

  if (!initialFields || initialFields.length === 0) {
    return (
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl text-center text-zinc-500 font-mono text-sm">
        Belum ada inventaris lapangan yang terdaftar.
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-white">
      {globalError && (
        <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 font-mono text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>NETWORK_GATEWAY_INTERRUPTION: {globalError}</span>
        </div>
      )}

      {/* FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex-1 space-y-1.5">
          <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
            <Map className="w-3 h-3" /> Pilih Lapangan
          </label>
          <select 
            value={selectedFieldId}
            onChange={(e) => setSelectedFieldId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-neon transition-colors"
          >
            {initialFields.map(field => (
              <option key={field.id} value={field.id}>{field.name} ({field.sport_type})</option>
            ))}
          </select>
        </div>

        <div className="flex-1 space-y-1.5">
          <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
            <CalendarDays className="w-3 h-3" /> Tanggal Operasional
          </label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-neon transition-colors"
          />
        </div>
      </div>

      {/* MATRIX GRID */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative min-h-[300px]">
        <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-brand-neon" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider">Matriks Kontrol Jam Operasional</h3>
          </div>
          {isLoadingSlots && <Loader2 className="w-4 h-4 animate-spin text-brand-neon" />}
        </div>

        {isLoadingSlots ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm rounded-xl">
             <span className="font-mono text-xs text-brand-neon uppercase tracking-widest">Sinkronisasi Ledger...</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-zinc-600 font-mono text-xs uppercase tracking-widest border border-dashed border-zinc-800 rounded-xl">
            Tidak ada slot jadwal untuk parameter ini
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {slots.map((slot) => (
              <MatrixCell
                key={slot.id}
                slot={slot}
                isUpdating={updatingId === slot.id}
                onToggle={handleToggleSlotStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}