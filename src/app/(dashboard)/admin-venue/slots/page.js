/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (dashboard)
 * Path: src/app/(dashboard)/admin-venue/slots/page.js
 * Deskripsi SRS: 
 * Panel kontrol manajemen waktu operasional lapangan khusus Admin Venue. Digunakan untuk mengonfigurasi jam buka-tutup, 
 * menetapkan harga sewa fluktuatif per jam (tarif weekend/night), serta memicu pembuatan baris slot ketersediaan 
 * secara otomatis berkala (pre-generated slots) ke database.
 */

"use client";

import React, { useState } from "react";
import { 
  Activity, 
  Calendar, 
  Lock, 
  Unlock, 
  Eye, 
  CheckCircle, 
  ShieldAlert,
  BarChart4,
  ScanBarcode,
  Grid
} from "lucide-react";

export default function AdminSlotsPage() {
  const [selectedDate, setSelectedDate] = useState("WE 24");
  
  // Real-time slot management state
  const [slots, setSlots] = useState([
    { id: "s1", time: "08:00", state: "BOOKED", customer: "Budi Santoso", phone: "+62 812-3456-7890", payment: "INV-8820" },
    { id: "s2", time: "09:00", state: "LOCKED", customer: null, payment: null },
    { id: "s3", time: "10:00", state: "AVAILABLE", customer: null, payment: null },
    { id: "s4", time: "11:00", state: "LOCKED", customer: null, payment: null },
    { id: "s5", time: "12:00", state: "BOOKED", customer: "Wayan Gede", phone: "+62 813-9876-5432", payment: "INV-8822" },
    { id: "s6", time: "13:00", state: "LOCKED", customer: null, payment: null },
    { id: "s7", time: "14:00", state: "LOCKED", customer: null, payment: null },
    { id: "s8", time: "15:00", state: "AVAILABLE", customer: null, payment: null },
    { id: "s9", time: "16:00", state: "AVAILABLE", customer: null, payment: null },
    { id: "s10", time: "17:00", state: "BOOKED", customer: "Ketut Adi", phone: "+62 811-5555-4444", payment: "INV-8828" },
    { id: "s11", time: "18:00", state: "AVAILABLE", customer: null, payment: null },
    { id: "s12", time: "19:00", state: "AVAILABLE", customer: null, payment: null },
    { id: "s13", time: "20:00", state: "BOOKED", customer: "Made Sukarta", phone: "+62 878-3333-2222", payment: "INV-8829" },
    { id: "s14", time: "21:00", state: "AVAILABLE", customer: null, payment: null },
    { id: "s15", time: "22:00", state: "LOCKED", customer: null, payment: null },
  ]);

  const [selectedAuditSlot, setSelectedAuditSlot] = useState(null);

  const dates = [
    { label: "WE 24", day: "WE", num: "24" },
    { label: "TH 25", day: "TH", num: "25" },
    { label: "FR 26", day: "FR", num: "26" },
  ];

  const handleToggleState = (slotId, newState) => {
    setSlots(slots.map(s => {
      if (s.id === slotId) {
        return { 
          ...s, 
          state: newState, 
          customer: newState === "BOOKED" ? "Forced Reservation" : null,
          payment: newState === "BOOKED" ? "ADMIN_FORCE" : null
        };
      }
      return s;
    }));
    if (selectedAuditSlot && selectedAuditSlot.id === slotId) {
      setSelectedAuditSlot(null);
    }
  };

  const navigateTo = (path) => {
    window.location.hash = path;
    if (window.__sportixNavigate) {
      window.__sportixNavigate(path);
    }
  };

  return (
    <div className="bg-[#09090b] text-[#e5e2e1] min-h-screen pb-16 font-sans select-none">
      
      {/* Top dashboard navigation bar */}
      <div className="border-b border-zinc-800 bg-[#0e0e0e] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 block leading-none">PARTNER SUITE</span>
              <h2 className="text-base font-black text-white">Academy Stadium Partner Suite</h2>
            </div>
          </div>

          <div className="flex bg-[#131313] border border-zinc-800/80 p-1 rounded-lg">
            <button 
              onClick={() => navigateTo("/admin-venue/slots")}
              className="bg-[#1c1b1b] text-white px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-800"
            >
              <Grid className="w-3.5 h-3.5 text-[#4edea3]" />
              <span>SLOT MATRIX</span>
            </button>
            <button 
              onClick={() => navigateTo("/admin-venue/scan")}
              className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <ScanBarcode className="w-3.5 h-3.5" />
              <span>SCANNER GATE</span>
            </button>
            <button 
              onClick={() => navigateTo("/admin-venue/reports")}
              className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <BarChart4 className="w-3.5 h-3.5" />
              <span>REPORTS</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">Court Slot Control Matrix</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Konfigurator taktis dan pengontrol status lapangan futsal elite. Otoritas penuh untuk mengubah status slot secara instan.
          </p>
        </div>

        {/* Date Row Selection */}
        <div className="flex gap-2 bg-[#131313] border border-zinc-800/80 p-3 rounded-lg mb-8 max-w-sm">
          {dates.map((d) => (
            <button
              key={d.label}
              onClick={() => setSelectedDate(d.label)}
              className={`flex-1 py-2 rounded font-mono text-xs font-bold transition-all ${
                selectedDate === d.label
                  ? "bg-zinc-800 border border-zinc-700 text-[#4edea3]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {d.label} (Oct 2026)
            </button>
          ))}
        </div>

        {/* Dual Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Timeline Matrix list (8 columns) */}
          <div className="lg:col-span-8 bg-[#131313] border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-6">
              Hourly Timeline control ({selectedDate})
            </h3>

            <div className="space-y-3">
              {slots.map((s) => (
                <div 
                  key={s.id}
                  className="bg-[#0e0e0e] border border-zinc-800/60 rounded-lg p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-base font-bold text-white w-14">
                      {s.time}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        s.state === "AVAILABLE" ? "bg-emerald-500" :
                        s.state === "LOCKED" ? "bg-amber-500 animate-pulse" : "bg-zinc-500"
                      }`} />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                        {s.state}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                    {/* View booked info */}
                    {s.state === "BOOKED" && (
                      <button
                        onClick={() => setSelectedAuditSlot(s)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 px-3 py-1.5 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#4edea3]" />
                        <span>INSPECT</span>
                      </button>
                    )}

                    {/* Operational control buttons */}
                    {s.state === "AVAILABLE" && (
                      <button
                        onClick={() => handleToggleState(s.id, "LOCKED")}
                        className="bg-amber-950/30 hover:bg-amber-950/80 text-amber-400 border border-amber-500/20 hover:border-amber-500/50 px-3 py-1.5 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>LOCK SLOT (SLA)</span>
                      </button>
                    )}

                    {s.state === "LOCKED" && (
                      <button
                        onClick={() => handleToggleState(s.id, "AVAILABLE")}
                        className="bg-emerald-950/30 hover:bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 px-3 py-1.5 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>RELEASE AVAILABLE</span>
                      </button>
                    )}

                    {s.state !== "BOOKED" && (
                      <button
                        onClick={() => handleToggleState(s.id, "BOOKED")}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 px-3 py-1.5 rounded text-[10px] font-mono cursor-pointer transition-all"
                      >
                        <span>FORCE BOOK</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit sidebar (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
                TACTICAL AUDIT PANEL
              </h3>

              {selectedAuditSlot ? (
                <div className="space-y-4">
                  <div className="bg-[#0e0e0e] border border-zinc-800/80 p-4 rounded-lg font-mono text-xs space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">TIME SLOT</span>
                      <span className="text-[#4edea3] font-bold">{selectedAuditSlot.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">ATHLETE</span>
                      <span className="text-white">{selectedAuditSlot.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">PHONE</span>
                      <span className="text-white">{selectedAuditSlot.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">TICKET INVOICE</span>
                      <span className="text-amber-400 font-bold">{selectedAuditSlot.payment}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded text-[11px] text-zinc-400 leading-normal">
                    <strong className="text-amber-400 uppercase font-mono block mb-1">RECOGNITION RULE WARNING:</strong>
                    Admin dapat merilis paksa status slot kembali ke AVAILABLE jika terverifikasi no-show melebihi batas toleransi 15 menit.
                  </div>

                  <button
                    onClick={() => handleToggleState(selectedAuditSlot.id, "AVAILABLE")}
                    className="w-full bg-red-900/30 hover:bg-red-900 border border-red-500/30 hover:border-transparent text-red-400 hover:text-white font-mono font-bold text-xs py-2.5 rounded transition-all"
                  >
                    FORFEIT TICKET & RELEASE
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-600 font-mono text-xs">
                  Pilih "INSPECT" pada slot dengan status BOOKED untuk memeriksa rincian tiket cashless atau melakukan pembatalan paksa.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}