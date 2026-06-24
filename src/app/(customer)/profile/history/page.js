/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (customer)
 * Path: src/app/(customer)/profile/history/page.js
 * Deskripsi SRS: 
 * Dasbor riwayat transaksi personal dan pelacakan invoice milik penyewa. Menampilkan struk digital komprehensif, 
 * status pelacakan logistik produk UMKM, serta rendering kode batang (E-Ticket Barcode) unik hasil enkripsi UUID 
 * reservasi untuk diverifikasi oleh admin venue saat tiba di lokasi.
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  MapPin,
  Ticket,
  QrCode,
  Clock,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function ProfileHistoryPage() {
  const [activeTab, setActiveTab] = useState("tickets"); // "tickets", "tournaments", "marketplace"
  const [tickets, setTickets] = useState([]);

  // Load from simulated localStorage on component mount
  useEffect(() => {
    const existing = localStorage.getItem("sportix_tickets");
    if (existing) {
      setTickets(JSON.parse(existing));
    } else {
      // Default initial tickets if empty, based on canvas scans
      const defaultTickets = [
        {
          ticketId: "INV-8829",
          venueId: "academy-stadium",
          venueName: "Academy Stadium",
          date: "WE 24 Oct",
          time: "10:00 - 11:00",
          price: "IDR 150,000",
          status: "ACTIVE",
          seat: "Sec 114, Row G, Seat 12"
        },
        {
          ticketId: "INV-8828",
          venueId: "academy-stadium",
          venueName: "Academy Stadium",
          date: "MO 22 Oct",
          time: "15:00 - 16:00",
          price: "IDR 150,000",
          status: "COMPLETED",
          seat: "Sec 114, Row G, Seat 11"
        }
      ];
      setTickets(defaultTickets);
      localStorage.setItem("sportix_tickets", JSON.stringify(defaultTickets));
    }
  }, []);

  // Custom Barcode generator using stylized divs
  const Barcode = ({ code }) => {
    return (
      <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-zinc-200">
      <div className="flex h-16 w-full items-stretch justify-center gap-[2px] bg-white px-2">
      {/* Create realistic barcode stripes */}
      <div className="w-[3px] bg-black" />
      <div className="w-[1px] bg-black" />
      <div className="w-[4px] bg-black" />
      <div className="w-[2px] bg-black" />
      <div className="w-[1px] bg-black" />
      <div className="w-[3px] bg-black" />
      <div className="w-[2px] bg-black" />
      <div className="w-[5px] bg-black" />
      <div className="w-[1px] bg-black" />
      <div className="w-[3px] bg-black" />
      <div className="w-[2px] bg-black" />
      <div className="w-[1px] bg-black" />
      <div className="w-[4px] bg-black" />
      <div className="w-[2px] bg-black" />
      <div className="w-[3px] bg-black" />
      <div className="w-[1px] bg-black" />
      <div className="w-[5px] bg-black" />
      <div className="w-[2px] bg-black" />
      <div className="w-[3px] bg-black" />
      <div className="w-[1px] bg-black" />
      <div className="w-[4px] bg-black" />
      <div className="w-[2px] bg-black" />
      </div>
      <div className="text-black text-center font-mono text-xs font-bold tracking-widest mt-2">
      {code}
      </div>
      </div>
    );
  };

  const handleGoToMarketplace = () => {
    window.location.hash = "/";
    if (window.__sportixNavigate) {
      window.__sportixNavigate("/");
    }
  };

  return (
    <div className="bg-[#09090b] text-[#e5e2e1] min-h-screen pb-16 font-sans select-none">
    {/* Header Container */}
    <div className="border-b border-zinc-800 bg-[#0e0e0e] py-6 px-6">
    <div className="max-w-7xl mx-auto">
    <div className="flex items-center gap-3.5 mb-2">
    <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 glow-emerald">
    <Award className="w-5 h-5" />
    </div>
    <div>
    <h1 className="text-2xl font-black text-white font-display">Athlete Dossier</h1>
    <p className="text-zinc-500 text-xs uppercase tracking-wider font-mono">
    Manage your competitive history and active passes
    </p>
    </div>
    </div>
    </div>
    </div>

    {/* Tabs Row */}
    <div className="max-w-7xl mx-auto px-6 mt-8">
    <div className="flex border-b border-zinc-800/80 gap-6 mb-8">
    <button
    onClick={() => setActiveTab("tickets")}
    className={`pb-4 text-sm font-semibold relative transition-all duration-200 cursor-pointer ${
      activeTab === "tickets" ? "text-emerald-400 font-bold" : "text-zinc-500 hover:text-zinc-300"
    }`}
    >
    My Tickets
    <span className="ml-1.5 bg-emerald-500/15 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-full font-mono">
    {tickets.filter(t => t.status === "ACTIVE").length} Active
    </span>
    {activeTab === "tickets" && (
      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 glow-emerald" />
    )}
    </button>

    <button
    onClick={() => {
      window.location.hash = "/tournaments";
      if (window.__sportixNavigate) {
        window.__sportixNavigate("/tournaments");
      }
    }}
    className="pb-4 text-sm font-semibold text-zinc-500 hover:text-zinc-300 transition-all duration-200 cursor-pointer"
    >
    Tournaments
    </button>

    <button
    onClick={() => {
      window.location.hash = "/umkm";
      if (window.__sportixNavigate) {
        window.__sportixNavigate("/umkm");
      }
    }}
    className="pb-4 text-sm font-semibold text-zinc-500 hover:text-zinc-300 transition-all duration-200 cursor-pointer"
    >
    Consignment Pro Shop
    </button>
    </div>

    {/* Tab Content: Tickets */}
    {activeTab === "tickets" && (
      <div className="space-y-8">
      {/* Warning Rule Bar */}
      <div className="bg-[#18181b] border-l-2 border-amber-500 p-4 rounded-r-lg flex gap-3.5 items-start">
      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 glow-amber" />
      <div>
      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
      Sistem Forfeit Otomatis (Threshold 15 Menit)
      </h4>
      <p className="text-xs text-zinc-400 leading-normal mt-0.5 font-sans">
      Terlambat masuk <span className="text-amber-400 font-bold">&gt;15 menit</span> menghanguskan tiket secara sepihak, dana disita 100%, dan slot sisa dirilis otomatis kembali ke status <span className="text-emerald-400 font-bold">AVAILABLE</span>. Tunjukkan barcode tiket Anda pada pintu masuk scanning di lapangan.
      </p>
      </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-2xl border-zinc-850">
        <Ticket className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-base font-bold text-zinc-300">Belum ada pemesanan aktif</h3>
        <p className="text-zinc-500 text-xs mt-1 mb-6 font-sans">
        Silakan temukan lapangan premium dan lakukan pemesanan melalui exploration engine.
        </p>
        <button
        onClick={handleGoToMarketplace}
        className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs py-2.5 px-5 rounded-lg transition-all duration-200 glow-emerald cursor-pointer uppercase tracking-wider"
        >
        Pesan Lapangan Sekarang
        </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tickets.map((t, index) => {
          const isActive = t.status === "ACTIVE";
          return (
            <div
            key={t.ticketId || index}
            className={`glass-panel rounded-2xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between ${
              isActive ? "border-emerald-500/40 hover:border-emerald-500/80" : "border-zinc-800 opacity-60"
            }`}
            >
            {/* Top color strap */}
            <div className={`h-1.5 ${isActive ? "bg-emerald-500 glow-emerald" : "bg-zinc-600"}`} />

            {/* Ticket content */}
            <div className="p-5 flex-1">
            <div className="flex justify-between items-start mb-4">
            <div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase block">VENUE ARENA</span>
            <h3 className="text-lg font-bold text-white leading-none mt-1">{t.venueName || "Academy Stadium"}</h3>
            </div>
            <span className={`text-[9px] font-mono font-bold px-2 py-1 rounded uppercase tracking-wider ${
              isActive ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-500"
            }`}>
            {t.status}
            </span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-y border-zinc-800/80 py-4 mb-4 text-xs font-mono">
            <div>
            <span className="text-[10px] text-zinc-500 uppercase block">PLAY DATE</span>
            <span className="text-zinc-300 font-bold">{t.date}</span>
            </div>
            <div>
            <span className="text-[10px] text-zinc-500 uppercase block">PLAY HOUR SLOT</span>
            <span className="text-emerald-400 font-bold">{t.time}</span>
            </div>
            <div>
            <span className="text-[10px] text-zinc-500 uppercase block">GATE / SEAT ASSIGN</span>
            <span className="text-zinc-300">{t.seat || "Gate A, Seat 12"}</span>
            </div>
            <div>
            <span className="text-[10px] text-zinc-500 uppercase block">SECURE CASHLESS PAID</span>
            <span className="text-amber-400 font-bold">{t.price}</span>
            </div>
            </div>

            {/* Barcode representation */}
            {isActive ? (
              <div className="mt-4 space-y-3">
              <Barcode code={t.ticketId} />
              <p className="text-[9px] font-mono text-center text-zinc-500 uppercase tracking-widest leading-none mt-1">
              TAP BARCODE UNDER SCANNER LUMINARY
              </p>
              </div>
            ) : (
              <div className="bg-[#0e0e0e] rounded p-4 text-center border border-zinc-800/60 flex items-center justify-center gap-2 text-zinc-500 font-mono text-xs">
              <CheckCircle className="w-4 h-4 text-zinc-600" />
              <span>TICKET COMPLETED & CHECKED IN</span>
              </div>
            )}
            </div>
            </div>
          );
        })}
        </div>
      )}
      </div>
    )}
    </div>
    </div>
  );
}
