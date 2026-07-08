"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, AlertTriangle, ShieldCheck, MapPin } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import DateCarousel from "./DateCarousel";
import SlotGrid from "./SlotGrid";
import PaymentDrawer from "./PaymentDrawer";
import { getAvailableSlots } from "../../../lib/services/venue.service";

const cn = (...inputs) => twMerge(clsx(inputs));

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function BookingClient({ venue }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeToken, setActiveToken] = useState(null);
  const [errorLog, setErrorLog] = useState(null);

  const fetchSlotsForDate = useCallback(async (dateStr) => {
    setLoadingSlots(true);
    setErrorLog(null);
    setSelectedSlot(null); 

    const { slots: fetchedSlots, error } = await getAvailableSlots(supabase, venue.id, dateStr);
    
    if (error) {
      setErrorLog(error);
    } else {
      setSlots(fetchedSlots);
    }
    
    setLoadingSlots(false);
  }, [venue.id]);

  useEffect(() => {
    fetchSlotsForDate(selectedDate);
  }, [selectedDate, fetchSlotsForDate]);

  const handleOpenPaymentGate = async () => {
    if (!selectedSlot) return;
    setErrorLog(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Otorisasi terputus. Sesi Anda tidak valid, harap log in kembali.");
      }

      setActiveToken(session.access_token);
      setIsDrawerOpen(true);
    } catch (err) {
      setErrorLog(err.message);
      fetchSlotsForDate(selectedDate);
      setSelectedSlot(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans">
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-2">
          {venue.name}
        </h1>
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <MapPin className="w-4 h-4 text-brand-emerald" />
          <span>{venue.address}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono font-bold tracking-wider text-zinc-500 uppercase">1. Tentukan Titik Waktu</h3>
        </div>
        <DateCarousel selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </div>

      {errorLog && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold font-mono">INTERUPSI SISTEM</p>
            <p className="mt-1 opacity-90">{errorLog}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono font-bold tracking-wider text-zinc-500 uppercase">2. Pilih Kapasitas (Jam)</h3>
          {loadingSlots && <Loader2 className="w-4 h-4 animate-spin text-brand-emerald" />}
        </div>
        
        {loadingSlots ? (
          <div className="h-48 flex items-center justify-center border border-zinc-800 border-dashed rounded-xl">
             <span className="text-xs font-mono text-zinc-500">MENGAMBIL LEDGER JADWAL...</span>
          </div>
        ) : (
          <SlotGrid slots={slots} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />
        )}
      </div>

      <div className="pt-6 border-t border-zinc-800">
        <button
          onClick={handleOpenPaymentGate}
          disabled={!selectedSlot || loadingSlots}
          className={cn(
            "w-full py-4 rounded-xl font-mono text-sm font-bold flex items-center justify-center gap-3 transition-all cursor-pointer",
            !selectedSlot 
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
              : "bg-brand-emerald text-background hover:bg-brand-emerald/90 hover:scale-[1.01] shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          )}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>
            {selectedSlot ? `BUKA KONFIRMASI PEMBAYARAN - RP ${selectedSlot.price.toLocaleString('id-ID')}` : 'PILIH SLOT TERLEBIH DAHULU'}
          </span>
        </button>
        <p className="text-center text-xs text-zinc-500 mt-3 font-mono">
          MENEKAN TOMBOL AKAN MENGUNCI JADWAL SECARA EKSKLUSIF SELAMA 15 MENIT DI TAHAP BERIKUTNYA
        </p>
      </div>

      <PaymentDrawer 
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          fetchSlotsForDate(selectedDate);
        }}
        selectedSlot={selectedSlot}
        venueName={venue.name}
        authToken={activeToken}
      />
    </div>
  );
}