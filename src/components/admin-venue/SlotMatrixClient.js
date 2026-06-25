"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Lock, Unlock, AlertTriangle } from "lucide-react";

export default function SlotMatrixClient({ initialSlots, currentDate, venueId }) {
  const router = useRouter();
  const [selectedAuditSlot, setSelectedAuditSlot] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Fungsi untuk mengeksekusi perubahan status ke backend
  const handleStateMutation = async (slotId, targetState, expectedCurrentState) => {
    setProcessingId(slotId);
    try {
      const response = await fetch("/api/slots/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId,
          targetState,
          expectedCurrentState
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Sinkronisasi data ulang dengan Server Components (SSR) tanpa reload halaman
        router.refresh();
        if (selectedAuditSlot?.id === slotId) {
          setSelectedAuditSlot(null);
        }
      } else {
        alert(data.message || "Gagal mengubah status slot.");
        router.refresh(); // Tetap refresh karena data di layar kemungkinan sudah usang (stale)
      }
    } catch (error) {
      alert("Kegagalan jaringan saat memanggil Command Center API.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Timeline Matrix list (8 columns) */}
      <div className="lg:col-span-8 bg-surface border border-zinc-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
            Hourly Timeline Matrix ({currentDate})
          </h3>
          <span className="text-micro font-mono bg-zinc-900 px-2 py-1 border border-zinc-800 rounded text-zinc-400">
            SYNCED WITH DATABASE
          </span>
        </div>

        {initialSlots.length === 0 ? (
          <div className="text-center py-12 border border-zinc-800 border-dashed rounded-lg text-zinc-500 font-mono text-xs">
            Tidak ada data slot yang dibuat untuk tanggal ini.
          </div>
        ) : (
          <div className="space-y-3">
            {initialSlots.map((s) => {
              const isProcessing = processingId === s.id;
              
              // Helper untuk mengekstrak data relasi pemesanan jika statusnya BOOKED
              const activeReservation = s.reservations?.find(r => r.status === 'CONFIRMED' || r.status === 'PENDING');
              const customerName = activeReservation?.users?.full_name || "Forced / Unknown";
              
              return (
                <div 
                  key={s.id}
                  className={`bg-surface-elevated border rounded-lg p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-all ${
                    isProcessing ? 'border-brand-neon opacity-50 pointer-events-none' : 'border-zinc-800/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-base font-bold text-white w-14">
                      {s.time.substring(0, 5)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        s.status === "AVAILABLE" ? "bg-brand-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                        s.status === "LOCKED" ? "bg-brand-amber animate-pulse" : "bg-zinc-500"
                      }`} />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                        {s.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                    {/* View booked info */}
                    {s.status === "BOOKED" && (
                      <button
                        onClick={() => setSelectedAuditSlot({ ...s, customer: customerName, payment: activeReservation?.payment_gateway_ref, phone: activeReservation?.users?.phone })}
                        disabled={isProcessing}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 px-3 py-1.5 rounded text-micro font-mono flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-neon" />
                        <span>INSPECT</span>
                      </button>
                    )}

                    {/* Operational control buttons */}
                    {s.status === "AVAILABLE" && (
                      <button
                        onClick={() => handleStateMutation(s.id, "LOCKED", "AVAILABLE")}
                        disabled={isProcessing}
                        className="bg-amber-950/30 hover:bg-amber-950/80 text-brand-amber border border-amber-500/20 hover:border-amber-500/50 px-3 py-1.5 rounded text-micro font-mono flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{isProcessing ? "PROCESSING..." : "LOCK SLOT"}</span>
                      </button>
                    )}

                    {s.status === "LOCKED" && (
                      <button
                        onClick={() => handleStateMutation(s.id, "AVAILABLE", "LOCKED")}
                        disabled={isProcessing}
                        className="bg-emerald-950/30 hover:bg-emerald-950/80 text-brand-emerald border border-emerald-500/20 hover:border-emerald-500/50 px-3 py-1.5 rounded text-micro font-mono flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>{isProcessing ? "PROCESSING..." : "RELEASE"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit sidebar (4 columns) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-surface border border-zinc-800 rounded-xl p-6 sticky top-24">
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
            TACTICAL AUDIT PANEL
          </h3>

          {selectedAuditSlot ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-surface-elevated border border-zinc-800/80 p-4 rounded-lg font-mono text-xs space-y-3">
                <div className="flex justify-between flex-col gap-1">
                  <span className="text-zinc-500">TIME SLOT</span>
                  <span className="text-brand-neon font-bold text-sm">{selectedAuditSlot.time.substring(0, 5)}</span>
                </div>
                <div className="flex justify-between flex-col gap-1">
                  <span className="text-zinc-500">ATHLETE / USER</span>
                  <span className="text-white font-sans font-bold">{selectedAuditSlot.customer || "N/A"}</span>
                </div>
                <div className="flex justify-between flex-col gap-1">
                  <span className="text-zinc-500">CONTACT</span>
                  <span className="text-white">{selectedAuditSlot.phone || "Tidak Ada Nomor"}</span>
                </div>
                <div className="flex justify-between flex-col gap-1 border-t border-zinc-800 pt-2">
                  <span className="text-zinc-500">PAYMENT INVOICE / REF</span>
                  <span className="text-brand-amber font-bold break-words">{selectedAuditSlot.payment || "MANUAL ADMIN OVERRIDE"}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded text-tiny text-zinc-400 leading-normal font-sans">
                <strong className="text-brand-amber uppercase font-mono block mb-1">RECOGNITION RULE WARNING:</strong>
                Admin berhak merilis paksa status slot kembali ke <span className="text-brand-emerald">AVAILABLE</span> jika atlet terverifikasi no-show melebihi batas toleransi 15 menit dari jam sewa.
              </div>

              <button
                onClick={() => handleStateMutation(selectedAuditSlot.id, "AVAILABLE", "BOOKED")}
                disabled={processingId === selectedAuditSlot.id}
                className="w-full bg-red-900/30 hover:bg-red-900 border border-red-500/30 hover:border-transparent text-red-400 hover:text-white font-mono font-bold text-xs py-3 rounded transition-all uppercase cursor-pointer disabled:opacity-50"
              >
                FORFEIT TICKET & RELEASE
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-600 font-mono text-xs border border-dashed border-zinc-800 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              Pilih &quot;INSPECT&quot; pada slot dengan status BOOKED di matriks untuk memverifikasi tiket cashless atau melakukan pembatalan paksa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}