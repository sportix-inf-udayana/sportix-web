/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (dashboard)
 * Path: src/app/(dashboard)/super-admin/verifications/page.js
 * Deskripsi SRS: 
 * Ruang kerja dengan hak istimewa tinggi (Super Admin) untuk menjaga integritas ekosistem Sportix. Digunakan untuk memeriksa, 
 * menguji keabsahan berkas hukum, dan menyetujui/menolak pengajuan akun usaha dari calon Admin Venue baru, sertifikasi keahlian pelatih, 
 * serta legalitas operasional seller UMKM Bali.
 */

"use client";

import React, { useState } from "react";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  FileText,
  Activity,
  Award,
  Grid,
  TrendingUp,
  Sliders
} from "lucide-react";

export default function SuperAdminVerificationsPage() {
  const [venues, setVenues] = useState([
    { id: "V-901", name: "Kuta Futsal Center", location: "Kuta Road, Badung", applicant: "Wayan Sukarta", status: "PENDING", date: "WE 24 Oct" },
    { id: "V-902", name: "Sanur Badminton Hall", location: "Bypass Sanur, Denpasar", applicant: "Agus Wijaya", status: "PENDING", date: "WE 24 Oct" },
    { id: "V-903", name: "Ubud Tennis Palace", location: "Ubud Peak, Gianyar", applicant: "Ketut Adi", status: "APPROVED", date: "MO 22 Oct" }
  ]);

  const [selectedVenue, setSelectedVenue] = useState(null);

  const handleApprove = (id) => {
    setVenues(venues.map(v => {
      if (v.id === id) {
        return { ...v, status: "APPROVED" };
      }
      return v;
    }));
    if (selectedVenue && selectedVenue.id === id) {
      setSelectedVenue(null);
    }
    alert(`Stadion ${id} berhasil disetujui! Kompleks telah aktif di exploration engine.`);
  };

  const handleReject = (id) => {
    setVenues(venues.map(v => {
      if (v.id === id) {
        return { ...v, status: "REJECTED" };
      }
      return v;
    }));
    if (selectedVenue && selectedVenue.id === id) {
      setSelectedVenue(null);
    }
    alert(`Pengajuan stadion ${id} ditolak.`);
  };

  const navigateTo = (path) => {
    window.location.hash = path;
    if (window.__sportixNavigate) {
      window.__sportixNavigate(path);
    }
  };

  return (
    <div className="bg-[#09090b] text-[#e5e2e1] min-h-screen pb-16 font-sans select-none">
      
      {/* Top Header & Navigation Switch */}
      <div className="border-b border-zinc-800 bg-[#0e0e0e] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 block leading-none">SUPER COMMAND SUITE</span>
              <h2 className="text-base font-black text-white">Super Admin Console</h2>
            </div>
          </div>

          <div className="flex bg-[#131313] border border-zinc-800/80 p-1 rounded-lg">
            <button 
              onClick={() => navigateTo("/super-admin/verifications")}
              className="bg-[#1c1b1b] text-white px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-800"
            >
              <Sliders className="w-3.5 h-3.5 text-red-400" />
              <span>ONBOARDING QUEUE</span>
            </button>
            <button 
              onClick={() => navigateTo("/super-admin/audits")}
              className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>GLOBAL LEDGER</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">Stadium Onboarding Queue</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Verifikasi kelayakan stadion, lapangan futsal, dan sarana olahraga baru sebelum resmi terdaftar di exploration engine nasional Sportix.
          </p>
        </div>

        {/* Dual Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Onboarding Table (8 Columns) */}
          <div className="lg:col-span-8 bg-[#131313] border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-red-400" /> STADIUM APPLICATION LIST
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 font-mono text-zinc-500 uppercase">
                    <th className="pb-3 font-semibold">ID / Nama Venue</th>
                    <th className="pb-3 font-semibold">Lokasi</th>
                    <th className="pb-3 font-semibold">Pendaftar</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {venues.map((v) => (
                    <tr key={v.id} className="hover:bg-[#18181b]/40">
                      <td className="py-4 pr-2">
                        <div className="font-sans font-bold text-white text-xs">{v.name}</div>
                        <span className="text-[10px] text-zinc-500">{v.id} • {v.date}</span>
                      </td>
                      <td className="py-4 text-zinc-400 font-sans">
                        {v.location}
                      </td>
                      <td className="py-4 text-zinc-300 font-sans">
                        {v.applicant}
                      </td>
                      <td className="py-4">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                          v.status === "PENDING" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" :
                          v.status === "REJECTED" ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                          "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => setSelectedVenue(v)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 p-1.5 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#4edea3]" />
                          <span>REVIEW</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Review Sidebar Document Viewer (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
                DOCUMENT REVIEW PANEL
              </h3>

              {selectedVenue ? (
                <div className="space-y-4 text-xs font-mono">
                  <div className="bg-[#0e0e0e] border border-zinc-800/80 p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-zinc-500 text-[10px] uppercase">VENUE ID</span>
                      <div className="text-[#e5e2e1] font-bold">{selectedVenue.id}</div>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] uppercase">OFFICIAL REGISTERED NAME</span>
                      <div className="text-white font-bold font-sans text-xs">{selectedVenue.name}</div>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[10px] uppercase">SUBMISSION APPLICANT</span>
                      <div className="text-white font-sans text-xs">{selectedVenue.applicant} (Owner)</div>
                    </div>
                  </div>

                  <div className="p-3 bg-red-950/20 border border-red-500/20 rounded text-[10px] text-zinc-400 leading-normal font-sans">
                    <strong>REGULATORY WARNING:</strong>
                    Persetujuan stadion memberikan hak akses bagi pengelola untuk menerbitkan court slots, memungut pembayaran cashless, serta menegakkan sanksi forfeit 15-menit.
                  </div>

                  {selectedVenue.status === "PENDING" && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => handleReject(selectedVenue.id)}
                        className="bg-red-900/20 hover:bg-red-950 border border-red-500/30 hover:border-transparent text-red-400 font-bold py-2 rounded transition-all uppercase tracking-wider font-mono text-[10px]"
                      >
                        REJECT
                      </button>
                      <button
                        onClick={() => handleApprove(selectedVenue.id)}
                        className="bg-[#4edea3] hover:bg-[#3cd094] text-[#003824] font-bold py-2 rounded transition-all uppercase tracking-wider font-mono text-[10px]"
                      >
                        APPROVE
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-600 font-mono text-xs">
                  Pilih "REVIEW" pada pengajuan stadion di sebelah kiri untuk memeriksa kelengkapan berkas kepatuhan hukum.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
