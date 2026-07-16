// src/components/booking/BookingClient.js
"use client";
import { useEffect } from 'react';
import DateCarousel from './DateCarousel';
import SlotGrid from './SlotGrid';
import PaymentDrawer from './PaymentDrawer';
import { useBookingMatrix } from '@/hooks/useBookingMatrix';

export default function BookingClient({ initialVenueData }) {
  const { state, actions } = useBookingMatrix(initialVenueData.id);

  useEffect(() => {
    actions.fetchSlotsForDate(state.selectedDate);
  }, [state.selectedDate, actions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans text-white">
      <div className="lg:col-span-2 space-y-6">
        <section className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-xl font-bold mb-4 font-display uppercase tracking-wide">Pilih Tanggal</h2>
          <DateCarousel selectedDate={state.selectedDate} onSelectDate={actions.setSelectedDate} />
        </section>

        <section className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 min-h-[200px]">
          <h2 className="text-xl font-bold mb-4 font-display uppercase tracking-wide">Slot Tersedia</h2>
          {state.loadingSlots ? (
            <div className="flex justify-center items-center h-20 text-zinc-500 font-mono text-sm animate-pulse uppercase tracking-widest">
              MEMUAT KETERSEDIAAN SISTEM...
            </div>
          ) : (
            <SlotGrid 
              slots={state.slots} 
              selectedSlot={state.selectedSlot} 
              onSelectSlot={actions.setSelectedSlot} 
            />
          )}
        </section>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 sticky top-24 shadow-sm">
          <h2 className="text-xl font-bold mb-4 font-display uppercase tracking-wide">Ringkasan</h2>
          
          {state.errorLog && (
            <div className="mb-4 p-3 text-xs text-red-400 bg-red-500/10 rounded-lg border border-red-500/20 font-mono uppercase tracking-wide">
              {state.errorLog}
            </div>
          )}

          <div className="space-y-3 mb-6 text-zinc-400">
            <div className="flex justify-between text-sm">
              <span>Tarif Dasar</span>
              <span className="font-mono font-bold text-white">Rp {Number(initialVenueData.price_per_hour || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Durasi Dipilih</span>
              <span className="font-mono font-bold text-white">{state.selectedSlot ? 1 : 0} Jam</span>
            </div>
            <hr className="my-3 border-zinc-800" />
            <div className="flex justify-between text-lg font-black text-white font-mono uppercase">
              <span>Total</span>
              <span className="text-brand-emerald">
                Rp {Number(state.selectedSlot?.price || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button 
            onClick={actions.initiatePayment}
            disabled={!state.selectedSlot || state.loadingSlots}
            className="w-full bg-brand-emerald text-black py-3.5 rounded-lg font-black disabled:opacity-50 disabled:shadow-none hover:bg-emerald-400 transition-all uppercase tracking-widest text-xs font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
          >
            Kunci Slot & Bayar
          </button>
        </div>
      </div>

      <PaymentDrawer 
        isOpen={state.isDrawerOpen} 
        onClose={actions.closeDrawer} 
        selectedSlot={state.selectedSlot} 
        venueId={initialVenueData.id}
        venueName={initialVenueData.name} 
        authToken={state.activeToken} 
      />
    </div>
  );
}