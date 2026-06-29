"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Lock, Unlock, AlertTriangle } from "lucide-react";

export default function SlotMatrixClient({ initialSlots = [], currentDate, venueId }) {
  const router = useRouter();
  const [selectedAuditSlot, setSelectedAuditSlot] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // DEFENSIVE FIX
  const safeSlots = Array.isArray(initialSlots) ? initialSlots : [];

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
        router.refresh();
        if (selectedAuditSlot?.id === slotId) {
          setSelectedAuditSlot(null);
        }
      } else {
        alert(data.message || "Gagal mengubah status slot.");
        router.refresh();
      }
    } catch (error) {
      alert("Kegagalan jaringan saat memanggil Command Center API.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 bg-surface border border-brand-slate/20 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-mono text-brand-slate uppercase tracking-wider">
            Hourly Timeline Matrix ({currentDate})
          </h3>
          <span className="text-micro font-mono bg-surface border border-brand-slate/20 px-2 py-1 rounded text-brand-slate">
            SYNCED WITH DATABASE
          </span>
        </div>

        {safeSlots.length === 0 ? (
          <div className="text-center py-12 border border-brand-slate/20 border-dashed rounded-lg text-brand-slate font-mono text-xs">
            Tidak ada data slot yang dibuat untuk tanggal ini.
          </div>
        ) : (
          <div className="space-y-3">
            {safeSlots.map((s) => {
              const isProcessing = processingId === s.id;
              
              const activeReservation = s.reservations?.find(r => r.status === 'CONFIRMED' || r.status === 'PENDING');
              const customerName = activeReservation?.users?.full_name || "Forced / Unknown";
              
              return (
                <div 
                  key={s.id}
                  className={`bg-surface-elevated border rounded-lg p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-all ${
                    isProcessing ? 'border-brand-neon opacity-50 pointer-events-none' : 'border-brand-slate/20 hover:border-brand-slate/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-base font-bold text-white w-14">
                      {s.time?.substring(0, 5) || "00:00"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        s.status === "AVAILABLE" ? "bg-brand-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                        s.status === "LOCKED" ? "bg-brand-amber animate-pulse" : "bg-brand-slate"
                      }`} />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-slate">
                        {s.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                    {s.status === "BOOKED" && (
                      <button
                        onClick={() => setSelectedAuditSlot({ ...s, customer: customerName, payment: activeReservation?.payment_gateway_ref, phone: activeReservation?.users?.phone })}
                        disabled={isProcessing}
                        className="bg-surface hover:bg-brand-slate/10 text-brand-slate border border-brand-slate/20 px-3 py-1.5 rounded text-micro font-mono flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-neon" />
                        <span>INSPECT</span>
                      </button>
                    )}

                    {s.status === "AVAILABLE" && (
                      <button
                        onClick={() => handleStateMutation(s.id, "LOCKED", "AVAILABLE")}
                        disabled={isProcessing}
                        className="bg-brand-amber/10 hover:bg-brand-amber/20 text-brand-amber border border-brand-amber/20 px-3 py-1.5 rounded text-micro font-mono flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{isProcessing ? "PROCESSING..." : "LOCK SLOT"}</span>
                      </button>
                    )}

                    {s.status === "LOCKED" && (
                      <button
                        onClick={() => handleStateMutation(s.id, "AVAILABLE", "LOCKED")}
                        disabled={isProcessing}
                        className="bg-brand-emerald/10 hover:bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/20 px-3 py-1.5 rounded text-micro font-mono flex items-center gap-1 cursor-pointer transition-all"
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

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-surface border border-brand-slate/20 rounded-xl p-6 sticky top-24">
          <h3 className="text-xs font-mono text-brand-slate uppercase tracking-wider mb-4">
            TACTICAL AUDIT PANEL
          </h3>

          {selectedAuditSlot ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-surface-elevated border border-brand-slate/20 p-4 rounded-lg font-mono text-xs space-y-3">
                <div className="flex justify-between flex-col gap-1">
                  <span className="text-brand-slate">TIME SLOT</span>
                  <span className="text-brand-neon font-bold text-sm">{selectedAuditSlot.time?.substring(0, 5) || "00:00"}</span>
                </div>
                <div className="flex justify-between flex-col gap-1">
                  <span className="text-brand-slate">ATHLETE / USER</span>
                  <span className="text-white font-sans font-bold">{selectedAuditSlot.customer || "N/A"}</span>
                </div>
                <div className="flex justify-between flex-col gap-1">
                  <span className="text-brand-slate">CONTACT</span>
                  <span className="text-white">{selectedAuditSlot.phone || "Tidak Ada Nomor"}</span>
                </div>
                <div className="flex justify-between flex-col gap-1 border-t border-brand-slate/20 pt-2">
                  <span className="text-brand-slate">PAYMENT INVOICE / REF</span>
                  <span className="text-brand-amber font-bold break-words">{selectedAuditSlot.payment || "MANUAL ADMIN OVERRIDE"}</span>
                </div>
              </div>

              <div className="p-3 bg-brand-amber/10 border border-brand-amber/20 rounded text-tiny text-brand-slate leading-normal font-sans">
                <strong className="text-brand-amber uppercase font-mono block mb-1">RECOGNITION RULE WARNING:</strong>
                Admin berhak merilis paksa status slot kembali ke <span className="text-brand-emerald">AVAILABLE</span> jika atlet terverifikasi no-show melebihi batas toleransi 15 menit dari jam sewa.
              </div>

              <button
                onClick={() => handleStateMutation(selectedAuditSlot.id, "AVAILABLE", "BOOKED")}
                disabled={processingId === selectedAuditSlot.id}
                className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-white font-mono font-bold text-xs py-3 rounded transition-all uppercase cursor-pointer disabled:opacity-50"
              >
                FORFEIT TICKET & RELEASE
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-brand-slate font-mono text-xs border border-dashed border-brand-slate/20 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-brand-slate mx-auto mb-2" />
              Pilih &quot;INSPECT&quot; pada slot dengan status BOOKED di matriks untuk memverifikasi tiket cashless atau melakukan pembatalan paksa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}