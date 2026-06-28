"use client";

import React, { useState } from "react";
import { Eye, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerificationClient({ initialVenues }) {
  const router = useRouter();
  const [venues, setVenues] = useState(initialVenues || []);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const handleAction = async (id, actionType) => {
    setLoadingAction(true);
    try {
      const response = await fetch("/api/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityId: id,
          entityType: "VENUE",
          action: actionType // 'APPROVE' or 'REJECT'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVenues(venues.filter(v => v.id !== id));
        setSelectedVenue(null);
        router.refresh();
      } else {
        alert(data.message || "Gagal memproses verifikasi.");
      }
    } catch (error) {
      alert("Kesalahan jaringan saat memanggil API Verifikasi.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
      {/* Onboarding Table (8 Columns) */}
      <div className="lg:col-span-8 bg-surface border border-brand-slate/20 rounded-xl p-6">
        <h3 className="text-xs font-mono text-brand-slate uppercase tracking-wider mb-6 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-brand-slate" /> STADIUM APPLICATION LIST (LIVE DB)
        </h3>

        {venues.length === 0 ? (
          <div className="text-center py-10 text-brand-slate font-mono text-xs border border-dashed border-brand-slate/20 rounded-lg">
            Tidak ada pengajuan venue yang menunggu verifikasi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-brand-slate/20 font-mono text-brand-slate uppercase">
                  <th className="pb-3 font-semibold">Nama Venue</th>
                  <th className="pb-3 font-semibold">Alamat</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-slate/20 font-mono">
                {venues.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-hover/40 transition-colors">
                    <td className="py-4 pr-2">
                      <div className="font-sans font-bold text-white text-xs">{v.name}</div>
                      <span className="text-micro text-brand-slate">{v.id.substring(0,8)}...</span>
                    </td>
                    <td className="py-4 text-brand-slate font-sans max-w-[200px] truncate">
                      {v.address || "Alamat belum dilengkapi"}
                    </td>
                    <td className="py-4">
                      <span className="text-micro font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wide bg-brand-amber/15 text-brand-amber border border-brand-amber/20">
                        {v.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => setSelectedVenue(v)}
                        className={`border p-1.5 rounded text-micro font-mono flex items-center gap-1 cursor-pointer ml-auto transition-all ${
                          selectedVenue?.id === v.id 
                            ? "bg-brand-slate/20 border-brand-neon text-white" 
                            : "bg-surface hover:bg-surface-hover text-brand-slate border-brand-slate/20"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-neon" />
                        <span>REVIEW</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Sidebar Document Viewer (4 Columns) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-surface border border-brand-slate/20 rounded-xl p-6 shadow-2xl relative">
          <h3 className="text-xs font-mono text-brand-slate uppercase tracking-wider mb-4">
            DOCUMENT REVIEW PANEL
          </h3>

          {loadingAction && (
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
               <div className="w-8 h-8 border-2 border-brand-neon border-t-transparent rounded-full animate-spin"></div>
             </div>
          )}

          {selectedVenue ? (
            <div className="space-y-4 text-xs font-mono animate-in fade-in duration-300">
              <div className="bg-surface-elevated border border-brand-slate/20 p-4 rounded-lg space-y-3">
                <div>
                  <span className="text-brand-slate text-micro uppercase">DATABASE UUID</span>
                  <div className="text-white font-bold break-all mt-1">{selectedVenue.id}</div>
                </div>
                <div>
                  <span className="text-brand-slate text-micro uppercase">OFFICIAL REGISTERED NAME</span>
                  <div className="text-white font-bold font-sans text-xs mt-1">{selectedVenue.name}</div>
                </div>
                <div>
                  <span className="text-brand-slate text-micro uppercase">OWNER ACCOUNT ID</span>
                  <div className="text-brand-slate font-sans text-xs break-all mt-1">{selectedVenue.owner_id}</div>
                </div>
              </div>

              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded text-micro text-brand-slate leading-relaxed font-sans">
                <strong className="text-red-400">REGULATORY WARNING:</strong><br/>
                Persetujuan stadion memberikan hak akses administratif penuh bagi pengelola untuk menerbitkan jadwal slot, memungut pembayaran via payment gateway, serta memberlakukan denda otomatis.
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleAction(selectedVenue.id, "REJECT")}
                  disabled={loadingAction}
                  className="bg-surface hover:bg-red-950/40 border border-red-500/30 hover:border-red-500 text-red-400 font-bold py-2.5 rounded transition-all uppercase tracking-wider font-mono text-micro cursor-pointer disabled:opacity-50"
                >
                  REJECT
                </button>
                <button
                  onClick={() => handleAction(selectedVenue.id, "APPROVE")}
                  disabled={loadingAction}
                  className="bg-brand-neon hover:bg-brand-emerald text-black font-black py-2.5 rounded transition-all uppercase tracking-wider font-mono text-micro shadow-[0_0_15px_rgba(78,222,163,0.3)] cursor-pointer disabled:opacity-50"
                >
                  APPROVE
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-brand-slate font-mono text-xs border border-brand-slate/20 border-dashed rounded-lg">
              Pilih &quot;REVIEW&quot; pada tabel di sebelah kiri untuk memeriksa metadata basis data entitas secara aman.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}