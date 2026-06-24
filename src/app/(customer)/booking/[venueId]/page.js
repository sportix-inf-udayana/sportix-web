"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Lock,
  Calendar,
  Clock,
  CheckCircle,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  X
} from "lucide-react";

export default function BookingGridPage() {
  const [selectedDate, setSelectedDate] = useState("WE 24");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [agreedToForfeit, setAgreedToForfeit] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);

  const [isSnapOpen, setIsSnapOpen] = useState(false);
  const [snapMethod, setSnapMethod] = useState("qris");
  const [snapProcessing, setSnapProcessing] = useState(false);
  const [pendingTicket, setPendingTicket] = useState(null);

  const dates = [
    { label: "WE 24", day: "WE", num: "24", sub: "TODAY" },
    { label: "TH 25", day: "TH", num: "25", sub: "25" },
    { label: "FR 26", day: "FR", num: "26", sub: "26" },
    { label: "SA 27", day: "SA", num: "27", sub: "27" },
    { label: "SU 28", day: "SU", num: "28", sub: "28" },
    { label: "MO 29", day: "MO", num: "29", sub: "29" },
    { label: "TU 30", day: "TU", num: "30", sub: "30" },
    { label: "WE 1", day: "WE", num: "1", sub: "1" },
  ];

  const initialSlots = [
    { id: "s1", time: "08:00", state: "BOOKED" },
    { id: "s2", time: "09:00", state: "LOCKED" },
    { id: "s3", time: "10:00", state: "AVAILABLE", price: 150000 },
    { id: "s4", time: "11:00", state: "LOCKED" },
    { id: "s5", time: "12:00", state: "BOOKED" },
    { id: "s6", time: "13:00", state: "LOCKED" },
    { id: "s7", time: "14:00", state: "LOCKED" },
    { id: "s8", time: "15:00", state: "AVAILABLE", price: 150000 },
    { id: "s9", time: "16:00", state: "AVAILABLE", price: 150000 },
    { id: "s10", time: "17:00", state: "BOOKED" },
    { id: "s11", time: "18:00", state: "AVAILABLE", price: 150000 },
    { id: "s12", time: "19:00", state: "AVAILABLE", price: 150000 },
    { id: "s13", time: "20:00", state: "BOOKED" },
    { id: "s14", time: "21:00", state: "AVAILABLE", price: 150000 },
    { id: "s15", time: "22:00", state: "LOCKED" },
  ];

  const handleSlotClick = (slot) => {
    if (slot.state === "AVAILABLE") {
      setSelectedSlot(slot);
      setIsDrawerOpen(true);
    } else if (slot.state === "LOCKED") {
      alert("Slot ini sedang dikunci oleh Slot Locking Agent (SLA) untuk transaksi lain.");
    } else if (slot.state === "BOOKED") {
      alert("Slot ini telah dipesan oleh atlet lain.");
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToForfeit) {
      alert("Anda wajib menyetujui Kebijakan Hangus Mutlak 15 Menit.");
      return;
    }
    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          time: selectedSlot.time,
          date: selectedDate,
          venueId: "academy-stadium",
          price: selectedSlot.price
        })
      });
      const data = await response.json();
      setCheckoutLoading(false);
      if (response.status === 409) {
        alert(data.message || "Conflict: Slot is already locked or booked.");
        return;
      }
      if (data.success) {
        setPendingTicket(data.ticket);
        setIsSnapOpen(true);
      } else {
        alert(data.message || "Gagal mengunci slot.");
      }
    } catch (err) {
      setCheckoutLoading(false);
      alert("Kesalahan jaringan saat menghubungi Slot Locking Agent (SLA).");
    }
  };

  const handleSnapPay = async () => {
    if (!pendingTicket) return;
    setSnapProcessing(true);
    try {
      const response = await fetch("/api/payments/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: pendingTicket.ticketId,
          transaction_status: "settlement",
          gross_amount: selectedSlot?.price || 150000,
          payment_type: snapMethod
        })
      });
      const data = await response.json();
      setSnapProcessing(false);
      if (data.reconciled) {
        setPaymentSuccess(true);
        setTicketDetails(pendingTicket);
        setIsSnapOpen(false);
      } else {
        alert("Webhook reconciliation failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      setSnapProcessing(false);
      alert("Kesalahan memproses simulasi pembayaran Midtrans Snap.");
    }
  };

  const navigateToHistory = () => {
    window.location.hash = "/profile/history";
    if (window.__sportixNavigate) {
      window.__sportixNavigate("/profile/history");
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen pb-24 font-sans select-none relative">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-emerald/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="border-b border-zinc-800 bg-surface-elevated/95 py-4 px-6 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              window.location.hash = "/venues/academy-stadium";
              if (window.__sportixNavigate) {
                window.__sportixNavigate("/venues/academy-stadium");
              }
            }}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
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

        {/* Date Selector */}
        <div className="glass-panel rounded-2xl p-4 mb-8">
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-neon" /> SELECT PLAY DATE
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {dates.map((d) => (
              <button
                key={d.label}
                onClick={() => setSelectedDate(d.label)}
                className={`flex flex-col items-center justify-between p-3 rounded-lg border transition-all duration-200 shrink-0 min-w-[70px] cursor-pointer ${
                  selectedDate === d.label
                    ? "bg-zinc-800 border-brand-emerald text-white"
                    : "bg-surface-elevated border-zinc-800/60 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <span className="text-micro font-mono uppercase tracking-widest">{d.day}</span>
                <span className="text-lg font-bold my-1">{d.num}</span>
                <span className="text-micro font-mono tracking-tighter text-zinc-500">{d.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-4 mb-6 glass-panel p-3 rounded-xl text-xs justify-center md:justify-start">
          <span className="text-zinc-500 font-mono uppercase tracking-widest text-micro mr-2">STATUS SLOT:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-brand-emerald rounded" />
            <span className="font-mono text-zinc-300">AVAILABLE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-brand-amber rounded animate-pulse" />
            <span className="font-mono text-zinc-300">LOCKED (SLA HELD)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-zinc-600 rounded flex items-center justify-center text-micro text-white">
              <Lock className="w-2.5 h-2.5" />
            </span>
            <span className="font-mono text-zinc-300">BOOKED (LOCKED)</span>
          </div>
        </div>

        {/* Booking Slots Grid */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-neon" /> Available Slots ({selectedDate})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {initialSlots.map((slot) => {
              if (slot.state === "AVAILABLE") {
                return (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotClick(slot)}
                    className="bg-brand-emerald text-black p-4 rounded-xl flex flex-col items-center justify-center font-black transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.35)] glow-emerald cursor-pointer group hover:scale-[1.02]"
                  >
                    <span className="text-micro font-mono tracking-widest mb-1 uppercase">AVAILABLE</span>
                    <span className="text-lg tracking-tight font-display">{slot.time}</span>
                    <span className="text-micro font-mono mt-2 opacity-80">IDR 150K</span>
                  </button>
                );
              } else if (slot.state === "LOCKED") {
                return (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotClick(slot)}
                    className="bg-brand-amber text-black p-4 rounded-xl flex flex-col items-center justify-center font-bold animate-pulse cursor-not-allowed text-center"
                  >
                    <Lock className="w-4 h-4 mb-1" />
                    <span className="text-xs font-mono tracking-wider">LOCKED</span>
                    <span className="text-lg tracking-tight">{slot.time}</span>
                  </button>
                );
              } else {
                return (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotClick(slot)}
                    className="bg-surface-hover border border-zinc-800 text-zinc-500 p-4 rounded-xl flex flex-col items-center justify-center font-semibold cursor-not-allowed relative overflow-hidden"
                  >
                    <Lock className="w-4 h-4 mb-1 text-zinc-600" />
                    <span className="text-xs font-mono tracking-wider text-zinc-600">BOOKED</span>
                    <span className="text-lg tracking-tight line-through opacity-40">{slot.time}</span>
                  </button>
                );
              }
            })}
          </div>
        </div>

        {/* Warning Policy Section */}
        <div className="mt-8 bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-5 flex gap-4 items-start">
          <AlertTriangle className="w-5 h-5 text-brand-amber shrink-0 mt-0.5 glow-amber" />
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

      {/* Checkout Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end items-end md:items-stretch">
          <div className="w-full md:max-w-md glass-panel border-t md:border-l border-zinc-800 h-auto md:h-full p-6 flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {paymentSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
                <div className="w-16 h-16 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center text-brand-neon mb-6 animate-bounce glow-emerald">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-display">Pemesanan Berhasil!</h3>
                <p className="text-zinc-400 text-xs mb-6 font-sans">
                  Pembayaran cashless terkonfirmasi oleh Payment Reconciliation Agent (PRA). Tiket Anda terbit dengan status aktif.
                </p>

                <div className="bg-surface-elevated border border-zinc-800 p-4 rounded-lg w-full text-left space-y-3 font-mono text-xs mb-8">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">TICKET ID</span>
                    <span className="text-brand-neon font-bold">{ticketDetails?.ticketId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">VENUE</span>
                    <span className="text-white">Academy Stadium</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">SLOT TIME</span>
                    <span className="text-white">{ticketDetails?.date}, {ticketDetails?.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">METHOD</span>
                    <span className="text-brand-amber">QRIS CASHLESS GATEWAY</span>
                  </div>
                </div>

                <button
                  onClick={navigateToHistory}
                  className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-black font-black py-4 rounded-xl text-sm transition-all duration-200 glow-emerald cursor-pointer uppercase tracking-tight"
                >
                  Lihat Tiket & Barcode
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between h-full pt-4">
                <div>
                  <span className="text-micro font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                    CONFIRM RESERVATION
                  </span>
                  <h3 className="text-lg font-bold text-white mb-6 font-display">
                    Detail Pembayaran Cashless
                  </h3>

                  <div className="space-y-4 mb-6 bg-surface-elevated p-4 rounded-lg border border-zinc-800/80 font-sans">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Lapangan</span>
                      <span className="font-bold text-white">Academy Stadium (Indoor Turf)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Tanggal</span>
                      <span className="font-mono text-white">{selectedDate} Oct 2026</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Jam Slot</span>
                      <span className="font-mono text-brand-neon font-bold">{selectedSlot?.time}</span>
                    </div>
                    <div className="border-t border-zinc-800 my-2 pt-3 flex justify-between items-center">
                      <span className="text-xs text-zinc-300 font-bold">TOTAL BAYAR</span>
                      <span className="font-mono text-base font-bold text-brand-neon">
                        IDR {selectedSlot?.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-micro font-mono text-zinc-500 uppercase block mb-2">
                      SISTEM CASHLESS (DIGITAL-ONLY)
                    </label>
                    <div className="bg-surface-elevated border border-zinc-800 rounded-lg p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber glow-amber">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="text-left flex-1 font-sans">
                        <h5 className="text-xs font-bold text-white leading-none mb-1">Sportix Instant Qris</h5>
                        <p className="text-micro text-zinc-500">Automatic reconciliation engine active</p>
                      </div>
                      <span className="text-micro bg-brand-emerald/15 border border-brand-emerald/30 text-brand-neon font-mono px-2 py-0.5 rounded uppercase">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-amber-950/20 border border-amber-500/20 p-3 rounded-lg mb-6">
                    <input
                      id="forfeit-checkbox"
                      type="checkbox"
                      checked={agreedToForfeit}
                      onChange={(e) => setAgreedToForfeit(e.target.checked)}
                      className="mt-0.5 accent-brand-emerald w-4 h-4 rounded cursor-pointer shrink-0"
                    />
                    <label htmlFor="forfeit-checkbox" className="text-micro text-zinc-400 leading-normal cursor-pointer select-none font-sans">
                      Saya bersedia menyetujui <span className="text-brand-amber font-bold">Kebijakan Forfeit &amp; Penyitaan 100% Dana</span> apabila terlambat masuk bermain melebihi <span className="text-brand-amber font-bold">&gt;15 menit</span>.
                    </label>
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-3">
                  <button
                    type="submit"
                    disabled={checkoutLoading}
                    className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-black font-black py-4 rounded-xl text-sm flex items-center justify-center gap-2 uppercase tracking-wide transition-all duration-300 disabled:opacity-40 glow-emerald cursor-pointer"
                  >
                    {checkoutLoading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Bayar Sekarang (Cashless)</span>
                      </>
                    )}
                  </button>
                  <p className="text-micro font-mono text-zinc-600 text-center uppercase tracking-widest">
                    🔒 SECURE SSL • AUTOMATIC PAYRECON AGENT (PRA) ACTIVE
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}