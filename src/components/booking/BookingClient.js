'use client';

import { useState, useEffect, useTransition } from 'react';
import { fetchAvailableSlotsAction, submitBookingAction } from '@/app/(customer)/booking/[venueId]/_actions.js';

export default function BookingClient({ initialVenueData }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  
  // State untuk menangani error saat checkout
  const [checkoutError, setCheckoutError] = useState(null);
  
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totalPrice = selectedSlots.length * initialVenueData.price_per_hour;

  // Fetch slot setiap kali tanggal berubah
  useEffect(() => {
    let isMounted = true;

    const loadSlots = async () => {
      setIsFetchingSlots(true);
      setSelectedSlots([]); // Reset pilihan jika tanggal berubah
      setCheckoutError(null); // Reset error jika user mengganti tanggal

      const result = await fetchAvailableSlotsAction(initialVenueData.id, selectedDate);
      
      if (isMounted) {
        if (!result.error && result.data) {
          setAvailableSlots(result.data);
        } else {
          setAvailableSlots([]); // Fallback jika gagal
        }
        setIsFetchingSlots(false);
      }
    };

    loadSlots();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, initialVenueData.id]);

  const handleSlotToggle = (slotId) => {
    setSelectedSlots((prev) => 
      prev.includes(slotId) ? prev.filter(id => id !== slotId) : [...prev, slotId]
    );
  };

  const handleCheckout = () => {
    if (selectedSlots.length === 0) return;

    setCheckoutError(null);
    startTransition(async () => {
      const result = await submitBookingAction({ 
        venueId: initialVenueData.id, 
        date: selectedDate, 
        slots: selectedSlots 
      });

      // Jika berhasil, Action akan me-redirect pengguna secara otomatis.
      // Jika sampai di baris ini, berarti ada error yang direturn dari server.
      if (result?.error) {
        setCheckoutError(result.error);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Kolom Kiri: Pemilihan Tanggal dan Slot */}
      <div className="lg:col-span-2 space-y-6">
        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Select Date</h2>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={isPending}
            className="border p-2 rounded w-full md:w-auto focus:outline-none focus:border-blue-500 disabled:opacity-50"
            min={new Date().toISOString().split('T')[0]}
          />
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200 min-h-[200px]">
          <h2 className="text-xl font-semibold mb-4">Available Slots</h2>
          
          {isFetchingSlots ? (
            <div className="flex justify-center items-center h-20 text-gray-500">
              Loading slots...
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {availableSlots.map(slot => (
                <button 
                  key={slot.id}
                  onClick={() => handleSlotToggle(slot.id)}
                  disabled={isPending}
                  className={`p-3 rounded border transition-colors ${
                    selectedSlots.includes(slot.id) 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-6">
              No slots available for this date.
            </div>
          )}
        </section>
      </div>

      {/* Kolom Kanan: Ringkasan dan Checkout */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-6">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          
          {/* Tampilan Error Checkout */}
          {checkoutError && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {checkoutError}
            </div>
          )}

          <div className="space-y-3 mb-6 text-gray-700">
            <div className="flex justify-between">
              <span>Price per hour</span>
              <span className="font-medium">Rp {initialVenueData.price_per_hour.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Selected slots</span>
              <span className="font-medium">{selectedSlots.length}</span>
            </div>
            <hr className="my-2 border-gray-200" />
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>Rp {totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={isPending || selectedSlots.length === 0 || isFetchingSlots}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            {isPending ? 'Processing Transaction...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}