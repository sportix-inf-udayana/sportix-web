// src/hooks/useBookingMatrix.js
import { useState, useCallback } from "react";
import { fetchAvailableSlotsAction } from "@/app/(customer)/booking/[venueId]/_actions";
import { getSupabase } from "@/lib/supabase"; 

export function useBookingMatrix(venueId) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Makassar' }));
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
      const { data, error } = await fetchAvailableSlotsAction(venueId, dateStr);
      if (error) throw new Error(error);
      setSlots(data || []);
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
      const supabase = getSupabase();
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
    fetchSlotsForDate(selectedDate);
  };

  return {
    state: { selectedDate, slots, loadingSlots, selectedSlot, errorLog, isDrawerOpen, activeToken },
    actions: { setSelectedDate, setSelectedSlot, fetchSlotsForDate, initiatePayment, closeDrawer }
  };
}