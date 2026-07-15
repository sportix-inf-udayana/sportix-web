"use client";

import { useState, useEffect } from 'react';
import { fetchAvailableSlotsAction } from '@/app/(customer)/booking/[venueId]/_actions';
import DateCarousel from './DateCarousel';
import SlotGrid from './SlotGrid';
import PaymentDrawer from './PaymentDrawer';
import { getSupabase } from '@/lib/supabase';

export default function BookingClient({ initialVenueData }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  const supabase = getSupabase();

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted && session) setAccessToken(session.access_token);
    });
    return () => { isMounted = false; };
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;
    const loadSlots = async () => {
      setIsFetchingSlots(true);
      setSelectedSlot(null);
      setCheckoutError(null);
      const result = await fetchAvailableSlotsAction(initialVenueData.id, selectedDate);
      
      if (isMounted) {
        setAvailableSlots(result.data || []);
        setIsFetchingSlots(false);
      }
    };
    loadSlots();
    return () => { isMounted = false; };
  }, [selectedDate, initialVenueData.id]);

  const handleCheckout = () => {
    if (!selectedSlot) return;
    if (!accessToken) {
      setCheckoutError("Sesi Anda tidak valid. Harap login kembali.");
      return;
    }
    setCheckoutError(null);
    setIsDrawerOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold mb-4 font-display">Pilih Tanggal</h2>
          <DateCarousel selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200 min-h-[200px]">
          <h2 className="text-xl font-bold mb-4 font-display">Slot Tersedia</h2>
          {isFetchingSlots ? (
            <div className="flex justify-center items-center h-20 text-gray-500 font-mono text-sm animate-pulse">
              Memuat ketersediaan sistem...
            </div>
          ) : (
            <SlotGrid 
              slots={availableSlots} 
              selectedSlot={selectedSlot} 
              onSelectSlot={setSelectedSlot} 
            />
          )}
        </section>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-24 shadow-sm">
          <h2 className="text-xl font-bold mb-4 font-display">Ringkasan</h2>
          
          {checkoutError && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 font-mono">
              {checkoutError}
            </div>
          )}

          <div className="space-y-3 mb-6 text-gray-700">
            <div className="flex justify-between text-sm">
              <span>Tarif per jam</span>
              <span className="font-mono font-bold">Rp {initialVenueData.price_per_hour.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Durasi dipilih</span>
              <span className="font-mono font-bold">{selectedSlot ? 1 : 0} Jam</span>
            </div>
            <hr className="my-2 border-gray-200" />
            <div className="flex justify-between text-lg font-black text-gray-900 font-mono">
              <span>Total</span>
              <span className="text-brand-emerald">
                Rp {selectedSlot ? initialVenueData.price_per_hour.toLocaleString('id-ID') : 0}
              </span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={!selectedSlot || isFetchingSlots}
            className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors uppercase tracking-widest text-xs font-mono shadow-md"
          >
            Selesaikan Reservasi
          </button>
        </div>
      </div>

      <PaymentDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        selectedSlot={selectedSlot ? { ...selectedSlot, price: initialVenueData.price_per_hour } : null} 
        venueName={initialVenueData.name} 
        authToken={accessToken} 
      />
    </div>
  );
}