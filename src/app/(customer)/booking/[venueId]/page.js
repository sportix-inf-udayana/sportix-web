"use client";

import React, { useState } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

// Menggunakan relative path mutlak sesuai instruksi Clean Architecture
import DateCarousel from "../../../../components/booking/DateCarousel";
import SlotGrid from "../../../../components/booking/SlotGrid";
import PaymentDrawer from "../../../../components/booking/PaymentDrawer";

export default function BookingGridPage() {
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState("WE 24");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Data statis awal (seharusnya di-fetch dari Supabase via server component di iterasi berikutnya)
  const dates = [
    { label: "WE 24", day: "WE", num: "24", sub: "TODAY" },
    { label: "TH 25", day: "TH", num: "25", sub: "25" },
    { label: "FR 26", day: "FR", num: "26", sub: "26" },
    { label: "SA 27", day: "SA", num: "27", sub: "27" },
  ];

  const initialSlots = [
    { id: "s1", time: "08:00", state: "BOOKED" },
    { id: "s2", time: "09:00", state: "LOCKED" },
    { id: "s3", time: "10:00", state: "AVAILABLE", price: 150000 },
    { id: "s4", time: "11:00", state: "AVAILABLE", price: 150000 },
    { id: "s5", time: "12:00", state: "BOOKED" },
  ];

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setIsDrawerOpen(true);
  };

  return (
    <div className="bg-background text-foreground min-h-screen pb-24 font-sans select-none relative">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-emerald/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Terisolasi */}
      <div className="border-b border-zinc-800 bg-surface-elevated/95 py-4 px-6 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/venues/academy-stadium")}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Detail Venue</span>
          </button>
          <div className="text-right">
            <span className="text-micro font-mono text-zinc-500 uppercase block">VENUE</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Academy Stadium</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <span className="text-xs font-mono text-zinc-500 tracking-wider uppercase block mb-1">
            DOWNTOWN COMPLEX
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display">
            Pemesanan & Jadwal Lapangan
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Premium indoor 5v5 turf. Dilengkapi dengan lampu sorot floodlit & permukaan sintetis standar atletik.
          </p>
        </div>

        {/* Delegasi Komponen UI */}
        <DateCarousel 
          dates={dates} 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate} 
        />

        <SlotGrid 
          slots={initialSlots} 
          selectedDate={selectedDate} 
          onSlotClick={handleSlotSelect} 
        />

        {/* Warning Policy Section */}
        <div className="mt-8 bg-surface-elevated border border-zinc-800/80 rounded-xl p-5 flex gap-4 items-start">
          <AlertTriangle className="w-5 h-5 text-brand-amber shrink-0 mt-0.5 shadow-[0_0_20px_rgba(245,158,11,0.15)]" />
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-brand-amber mb-1">
              Aturan Ketat Forfeit & No-Show Sebermula 15 Menit
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Semua slot dijamin oleh Slot Locking Agent (SLA). Keterlambatan bermain melebihi <span className="text-brand-amber font-bold">&gt;15 menit</span> terhitung waktu slot akan <span className="text-red-400 font-bold">menghanguskan e-ticket secara sepihak</span>. Dana transaksi disita 100% oleh sistem, dan sisa durasi slot dirilis kembali secara otomatis ke marketplace dengan status <span className="text-brand-neon font-bold">AVAILABLE</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Komponen Laci Pembayaran Modal */}
      <PaymentDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        venueName="Academy Stadium"
      />
    </div>
  );
}