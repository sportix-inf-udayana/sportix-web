"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, ShieldCheck, MapPin } from "lucide-react";

import DateCarousel from "./DateCarousel";
import SlotGrid from "./SlotGrid";

export default function BookingClient({ venue, user }) {
  const router = useRouter();
  
  // State Manajemen Transaksi
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  //State Eksekusi Keamanan
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorLog, setErrorLog] = useState(null);

  // Kunci instansi Supabase dengan useMemo agar tidak diciptakan ulang
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), []);

  // Bungkus fungsi tarikan data dengan useCallback
  const fetchSlotsForDate = useCallback(async (dateStr) => {
    setLoadingSlots(true);
    setErrorLog(null);
    setSelectedSlot(null); 

    try {
      const { data: fieldData, error: fieldError } = await supabase
        .from('fields')
        .select('id, name, price_per_hour')
        .eq('venue_id', venue.id)
        .limit(1)
        .single();

      if (fieldError || !fieldData) {
        throw new Error("Arena ini belum mendaftarkan entitas lapangan yang valid.");
      }

      const { data: slotData, error: slotError } = await supabase
        .from('slots')
        .select('id, field_id, slot_date, start_time, end_time, status, locked_until')
        .eq('field_id', fieldData.id)
        .eq('slot_date', dateStr)
        .order('start_time', { ascending: true });

      if (slotError) throw slotError;
      
      const mappedSlots = (slotData || []).map(s => ({
        ...s,
        price: fieldData.price_per_hour,
        fieldName: fieldData.name
      }));

      setSlots(mappedSlots);
    } catch (err) {
      console.error("Sinkronisasi Ledger Gagal:", err);
      setErrorLog(err.message || "Gagal memuat jadwal matriks ketersediaan.");
    } finally {
      setLoadingSlots(false);
    }
  }, [venue.id, supabase]); // Parameter dependensi mutlak

  useEffect(() => {
    fetchSlotsForDate(selectedDate);
  }, [selectedDate, fetchSlotsForDate]);

  const handleLockAndCheckout = async () => {
    if (!selectedSlot) return;
    setIsProcessing(true);
    setErrorLog(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Otorisasi terputus. Sesi JWT Anda tidak valid atau telah kadaluarsa.");
      }

      // Eksekusi permintaan ke backend
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          time: selectedSlot.start_time,
          date: selectedSlot.slot_date,
          price: selectedSlot.price
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Kondisi Balapan: Slot telah direbut.");
      }

      // Cegat eksekusi jika Snap belum termuat oleh browser
      if (!window.snap) {
        throw new Error("Mesin pembayaran Midtrans gagal dimuat. Periksa koneksi internet Anda.");
      }

      // Panggil Snap Window dengan token asli
      window.snap.pay(result.payment_token, {
        onSuccess: function(paymentResult) {
          console.log("Transaksi Selesai", paymentResult);
          // Midtrans Webhook (di server) yang akan mengubah status ke CONFIRMED.
          // Klien hanya perlu dipindahkan ke halaman riwayat.
          router.push("/profile/history");
        },
        onPending: function(paymentResult) {
          console.log("Menunggu Pembayaran", paymentResult);
          router.push("/profile/history");
        },
        onError: function(paymentResult) {
          console.error("Pembayaran Gagal", paymentResult);
          setErrorLog("Transaksi ditolak oleh sistem pembayaran.");
          fetchSlotsForDate(selectedDate);
          setSelectedSlot(null);
        },
        onClose: function() {
          // Jika pelanggan iseng menutup popup sebelum membayar
          console.warn("Popup ditutup tanpa penyelesaian.");
          setErrorLog("Sistem membatalkan transaksi karena jendela ditutup.");
          fetchSlotsForDate(selectedDate);
          setSelectedSlot(null);
        }
      });

    } catch (err) {
      setErrorLog(err.message);
      fetchSlotsForDate(selectedDate); 
      setSelectedSlot(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans">
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-2">
          {venue.name}
        </h1>
        <div className="flex items-center gap-2 text-brand-slate text-sm">
          <MapPin className="w-4 h-4 text-brand-emerald" />
          <span>{venue.address}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono font-bold tracking-wider text-brand-slate uppercase">1. Tentukan Titik Waktu</h3>
        </div>
        <DateCarousel 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate} 
        />
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
          <h3 className="text-sm font-mono font-bold tracking-wider text-brand-slate uppercase">2. Pilih Kapasitas (Jam)</h3>
          {loadingSlots && <Loader2 className="w-4 h-4 animate-spin text-brand-emerald" />}
        </div>
        
        {loadingSlots ? (
          <div className="h-48 flex items-center justify-center border border-zinc-800 border-dashed rounded-xl">
             <span className="text-xs font-mono text-zinc-500">MENGAMBIL LEDGER JADWAL...</span>
          </div>
        ) : (
          <SlotGrid 
            slots={slots} 
            selectedSlot={selectedSlot} 
            onSelectSlot={setSelectedSlot} 
          />
        )}
      </div>

      <div className="pt-6 border-t border-zinc-800">
        <button
          onClick={handleLockAndCheckout}
          disabled={!selectedSlot || isProcessing}
          className={`w-full py-4 rounded-xl font-mono text-sm font-bold flex items-center justify-center gap-3 transition-all
            ${!selectedSlot 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-brand-emerald text-background hover:bg-brand-emerald/90 hover:scale-[1.01] shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>MENGAMANKAN JARINGAN...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>
                {selectedSlot 
                  ? `OTORISASI PEMBAYARAN - RP ${selectedSlot.price.toLocaleString('id-ID')}` 
                  : 'PILIH SLOT TERLEBIH DAHULU'
                }
              </span>
            </>
          )}
        </button>
        <p className="text-center text-xs text-brand-slate mt-3 font-mono">
          MENEKAN TOMBOL AKAN MENGUNCI JADWAL SECARA EKSKLUSIF SELAMA 15 MENIT
        </p>
      </div>

    </div>
  );
}