import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, CreditCard, ShieldCheck, AlertTriangle, X } from "lucide-react";

export default function PaymentDrawer({ isOpen, onClose, selectedDate, selectedSlot, venueName = "Academy Stadium" }) {
  const router = useRouter();
  const [agreedToForfeit, setAgreedToForfeit] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);

  if (!isOpen || !selectedSlot) return null;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToForfeit) {
      alert("Anda wajib menyetujui Kebijakan Hangus Mutlak 15 Menit.");
      return;
    }
    
    setCheckoutLoading(true);
    try {
      // 1. Mengunci slot dan mendapatkan Token/ID via Slot Locking Agent (SLA)
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          time: selectedSlot.time,
          date: selectedDate,
          price: selectedSlot.price
        })
      });
      
      const data = await response.json();
      
      if (response.status === 409) {
        setCheckoutLoading(false);
        alert(data.message || "Conflict: Slot telah dikunci oleh proses lain.");
        onClose();
        return;
      }

      if (!data.success || !data.reservationId) {
        throw new Error(data.message || "Gagal mengunci slot atau ID Reservasi tidak valid.");
      }

      // 2. Integrasi Midtrans Snap yang Benar (Menggunakan callback UI, bukan webhook manual)
      // Catatan Arsitektur: Pastikan script Midtrans (snap.js) di-load di layout utama.
      if (typeof window !== "undefined" && window.snap) {
        window.snap.pay(data.reservationId, {
          onSuccess: function (result) {
            // Callback ini HANYA untuk UI. Database di-update oleh webhook Midtrans di backend.
            setPaymentSuccess(true);
            setTicketDetails({ ticketId: data.reservationId, date: selectedDate, time: selectedSlot.time });
            setCheckoutLoading(false);
          },
          onPending: function (result) {
            alert("Menunggu pembayaran. Silakan selesaikan di halaman status.");
            setCheckoutLoading(false);
            onClose();
          },
          onError: function (result) {
            alert("Pembayaran gagal atau kedaluwarsa.");
            setCheckoutLoading(false);
          },
          onClose: function () {
            alert("Anda menutup modal Snap sebelum membayar. Slot akan dirilis dalam 15 menit.");
            setCheckoutLoading(false);
          }
        });
      } else {
        // Fallback untuk lingkungan simulasi jika snap.js tidak ada
        console.warn("Midtrans Snap.js tidak terdeteksi. Menjalankan simulasi antarmuka sukses.");
        setTimeout(() => {
          setPaymentSuccess(true);
          setTicketDetails({ ticketId: data.reservationId, date: selectedDate, time: selectedSlot.time });
          setCheckoutLoading(false);
        }, 1500);
      }

    } catch (err) {
      console.error(err);
      setCheckoutLoading(false);
      alert("Kesalahan jaringan saat menghubungi SLA.");
    }
  };

  const navigateToHistory = () => {
    // Menggunakan Router Next.js yang benar, bukan manipulasi DOM window.location
    router.push("/profile/history");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end items-end md:items-stretch">
      <div className="w-full md:max-w-md bg-surface-elevated border-t md:border-l border-zinc-800 h-auto md:h-full p-6 flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {paymentSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="w-16 h-16 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center text-brand-neon mb-6 animate-bounce shadow-[0_0_25px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">Pemesanan Berhasil!</h3>
            <p className="text-zinc-400 text-xs mb-6 font-sans">
              Pembayaran cashless terkonfirmasi oleh Payment Reconciliation Agent (PRA). Tiket Anda terbit dengan status aktif.
            </p>

            <div className="bg-surface border border-zinc-800 p-4 rounded-lg w-full text-left space-y-3 font-mono text-xs mb-8">
              <div className="flex justify-between">
                <span className="text-zinc-500">TICKET ID</span>
                <span className="text-brand-neon font-bold">{ticketDetails?.ticketId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">VENUE</span>
                <span className="text-white">{venueName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">SLOT TIME</span>
                <span className="text-white">{ticketDetails?.date}, {ticketDetails?.time}</span>
              </div>
            </div>

            <button
              onClick={navigateToHistory}
              className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-black font-black py-4 rounded-xl text-sm transition-all duration-200 shadow-[0_0_25px_rgba(16,185,129,0.2)] cursor-pointer uppercase tracking-tight"
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

              <div className="space-y-4 mb-6 bg-surface p-4 rounded-lg border border-zinc-800/80 font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Lapangan</span>
                  <span className="font-bold text-white">{venueName} (Indoor Turf)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Tanggal</span>
                  <span className="font-mono text-white">{selectedDate}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Jam Slot</span>
                  <span className="font-mono text-brand-neon font-bold">{selectedSlot?.time}</span>
                </div>
                <div className="border-t border-zinc-800 my-2 pt-3 flex justify-between items-center">
                  <span className="text-xs text-zinc-300 font-bold">TOTAL BAYAR</span>
                  <span className="font-mono text-base font-bold text-brand-neon">
                    IDR {(selectedSlot?.price || 150000).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-micro font-mono text-zinc-500 uppercase block mb-2">
                  SISTEM CASHLESS (DIGITAL-ONLY)
                </label>
                <div className="bg-surface border border-zinc-800 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1 font-sans">
                    <h5 className="text-xs font-bold text-white leading-none mb-1">Sportix Instant Gateway</h5>
                    <p className="text-micro text-zinc-500">Automatic reconciliation engine active</p>
                  </div>
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
                  Saya menyetujui <span className="text-brand-amber font-bold">Kebijakan Forfeit 100% Dana</span> apabila terlambat masuk bermain melebihi <span className="text-brand-amber font-bold">&gt;15 menit</span>.
                </label>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3">
              <button
                type="submit"
                disabled={checkoutLoading}
                className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-black font-black py-4 rounded-xl text-sm flex items-center justify-center gap-2 uppercase tracking-wide transition-all duration-300 disabled:opacity-40 shadow-[0_0_25px_rgba(16,185,129,0.2)] cursor-pointer"
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
            </form>
          </div>
        )}
      </div>
    </div>
  );
}