"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import DateCarousel from "./DateCarousel";
import SlotGrid from "./SlotGrid";
import PaymentDrawer from "./PaymentDrawer";

export default function BookingClient({ venueName, dates, initialSlots }) {
  const [selectedDate, setSelectedDate] = useState(dates[0]?.label || "WE 24");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setIsDrawerOpen(true);
  };

  return (
    <div className="mt-8">
      {/* Delegasi Komponen Interaktif */}
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
      <div className="mt-8 bg-surface-elevated border border-brand-slate/20 rounded-xl p-5 flex gap-4 items-start">
        <AlertTriangle className="w-5 h-5 text-brand-amber shrink-0 mt-0.5 shadow-[0_0_20px_rgba(245,158,11,0.15)]" />
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-brand-amber mb-1">
            Aturan Ketat Forfeit & No-Show Sebermula 15 Menit
          </h4>
          <p className="text-xs text-brand-slate leading-relaxed font-sans">
            Semua slot dijamin oleh Slot Locking Agent (SLA). Keterlambatan bermain melebihi <span className="text-brand-amber font-bold">&gt;15 menit</span> terhitung waktu slot akan <span className="text-red-500 font-bold">menghanguskan e-ticket secara sepihak</span>. Dana transaksi disita 100% oleh sistem, dan sisa durasi slot dirilis kembali secara otomatis ke marketplace dengan status <span className="text-brand-neon font-bold">AVAILABLE</span>.
          </p>
        </div>
      </div>

      {/* Komponen Laci Pembayaran Modal */}
      <PaymentDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        venueName={venueName}
      />
    </div>
  );
}