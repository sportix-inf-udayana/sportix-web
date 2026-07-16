// src/components/booking/PaymentDrawer.js
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, CreditCard, ShieldCheck, X, Loader2 } from "lucide-react";

export default function PaymentDrawer({ isOpen, onClose, selectedSlot, venueId, venueName = "Arena", authToken }) {
  const router = useRouter();
  const [agreedToForfeit, setAgreedToForfeit] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);

  if (!isOpen || !selectedSlot) return null;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToForfeit) {
      alert("Kebijakan Hangus Mutlak 15 Menit wajib disetujui.");
      return;
    }
    
    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          venueId: venueId,
          slotIds: [selectedSlot.id]
        })
      });
      
      const data = await response.json();
      
      if (response.status === 409) {
        setCheckoutLoading(false);
        alert(data.error?.message || "Conflict: Slot telah dikunci oleh entitas lain.");
        onClose();
        return;
      }

      if (!response.ok || !data.data?.payment_token) {
        throw new Error(data.error?.message || "Gagal mengamankan transaksi.");
      }

      const token = data.data.payment_token;
      const bookingId = data.data.bookingId;

      if (typeof window !== "undefined" && window.snap) {
        window.snap.pay(token, {
          onSuccess: () => {
            setPaymentSuccess(true);
            setTicketDetails({ ticketId: `REV-${bookingId}`, date: selectedSlot.slot_date, time: selectedSlot.start_time });
            setCheckoutLoading(false);
          },
          onPending: () => {
            alert("Menunggu pembayaran diselesaikan.");
            setCheckoutLoading(false);
            router.push("/profile/history");
            onClose();
          },
          onError: () => {
            alert("Pembayaran gagal. Kunci SLA terlepas.");
            setCheckoutLoading(false);
          },
          onClose: () => {
            alert("Gateway ditutup. Slot akan dilepas saat Timeout Gateway tercapai.");
            setCheckoutLoading(false);
          }
        });
      } else {
        throw new Error("Snap.js tidak terdeteksi. Matikan AdBlocker jika aktif.");
      }
    } catch (err) {
      console.error(err);
      setCheckoutLoading(false);
      alert(err.message || "Interupsi jaringan.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex justify-end items-end md:items-stretch font-sans">
      <div className="w-full md:max-w-md bg-zinc-950 border-t md:border-l border-zinc-800 h-auto md:h-full p-6 flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {paymentSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-brand-emerald mb-6 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white mb-2 font-display uppercase tracking-wide">Pemesanan Berhasil</h3>
            <p className="text-zinc-400 text-xs mb-6 font-sans">
              Pembayaran cashless terkonfirmasi. Tiket Anda terbit dengan status <span className="text-brand-emerald font-bold">CONFIRMED</span>.
            </p>

            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl w-full text-left space-y-3 font-mono text-xs mb-8">
              <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                <span className="text-zinc-500">TICKET ID</span>
                <span className="text-brand-emerald font-bold truncate max-w-[150px]">{ticketDetails?.ticketId}</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                <span className="text-zinc-500">VENUE</span>
                <span className="text-white font-bold">{venueName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">SLOT TIME</span>
                <span className="text-white font-bold">{ticketDetails?.date}, {ticketDetails?.time?.substring(0,5)}</span>
              </div>
            </div>

            <button
              onClick={() => { onClose(); router.push("/profile/history"); }}
              className="w-full bg-brand-emerald hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-xs transition-all duration-200 shadow-[0_0_25px_rgba(16,185,129,0.2)] cursor-pointer uppercase tracking-widest font-mono"
            >
              Lihat Tiket & Barcode
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between h-full pt-4">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
                CONFIRM RESERVATION
              </span>
              <h3 className="text-xl font-black text-white mb-6 font-display uppercase tracking-tight">
                Detail Pembayaran
              </h3>

              <div className="space-y-4 mb-6 bg-zinc-900 p-5 rounded-xl border border-zinc-800 font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Lapangan</span>
                  <span className="font-bold text-white text-right">{venueName} <br/><span className="text-[10px] text-zinc-500 font-mono">({selectedSlot?.fields?.name || "Main Field"})</span></span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Jadwal</span>
                  <span className="font-mono text-white font-bold text-right">
                    {selectedSlot?.slot_date} <br/> <span className="text-brand-emerald">{selectedSlot?.start_time?.substring(0,5)} - {selectedSlot?.end_time?.substring(0,5)}</span>
                  </span>
                </div>
                <div className="border-t border-zinc-800 my-2 pt-4 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">TOTAL BAYAR</span>
                  <span className="font-mono text-lg font-black text-brand-emerald">
                    Rp {Number(selectedSlot?.price || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase block mb-2">
                  SISTEM CASHLESS (DIGITAL-ONLY)
                </label>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1 font-sans">
                    <h5 className="text-xs font-bold text-white leading-none mb-1 uppercase">Sportix Instant Gateway</h5>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase">Automatic reconciliation</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl mb-6">
                <input
                  id="forfeit-checkbox"
                  type="checkbox"
                  checked={agreedToForfeit}
                  onChange={(e) => setAgreedToForfeit(e.target.checked)}
                  className="mt-0.5 accent-brand-emerald w-4 h-4 rounded cursor-pointer shrink-0 border-zinc-700"
                />
                <label htmlFor="forfeit-checkbox" className="text-xs text-zinc-400 leading-relaxed cursor-pointer select-none font-sans">
                  Saya menyetujui <span className="text-amber-500 font-bold">Kebijakan Forfeit 100% Dana</span> apabila terlambat masuk bermain melebihi toleransi <span className="text-amber-500 font-bold">15 menit</span>.
                </label>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 mt-4">
              <button
                type="submit"
                disabled={checkoutLoading}
                className="w-full bg-brand-emerald hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-xs flex items-center justify-center gap-2 uppercase tracking-widest transition-all duration-300 disabled:opacity-40 shadow-[0_0_25px_rgba(16,185,129,0.2)] cursor-pointer font-mono"
              >
                {checkoutLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>SLA LOCK & BAYAR</span>
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