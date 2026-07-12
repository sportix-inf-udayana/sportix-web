import { useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { getAvailableSlots } from "@/lib/services/venue.service";

// Inisialisasi di luar komponen agar tidak terjadi re-instantiation
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function useBookingMatrix(venueId) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [errorLog, setErrorLog] = useState(null);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeToken, setActiveToken] = useState(null);

  const fetchSlotsForDate = useCallback(async (dateStr) => {
    setLoadingSlots(true);
    setErrorLog(null);
    setSelectedSlot(null); 

    try {
      const { slots: fetchedSlots, error } = await getAvailableSlots(supabase, venueId, dateStr);
      if (error) throw new Error(error);
      setSlots(fetchedSlots);
    } catch (err) {
      setErrorLog(err.message);
    } finally {
      setLoadingSlots(false);
    }
  }, [venueId]);

  const initiatePayment = async () => {
    if (!selectedSlot) return;
    setErrorLog(null);

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        throw new Error("Otorisasi terputus. Sesi Anda tidak valid, harap log in kembali.");
      }

      setActiveToken(session.access_token);
      setIsDrawerOpen(true);
    } catch (err) {
      setErrorLog(err.message);
      setSelectedSlot(null);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    fetchSlotsForDate(selectedDate); // Refresh ketersediaan slot setelah transaksi
  };

  return {
    state: { selectedDate, slots, loadingSlots, selectedSlot, errorLog, isDrawerOpen, activeToken },
    actions: { setSelectedDate, setSelectedSlot, fetchSlotsForDate, initiatePayment, closeDrawer }
  };
}