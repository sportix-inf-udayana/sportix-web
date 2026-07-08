export async function getAvailableSlots(supabase, venueId, dateStr) {
  try {
    const { data: fieldData, error: fieldError } = await supabase
      .from('fields')
      .select('id, name, price_per_hour')
      .eq('venue_id', venueId)
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
    
    const slots = (slotData || []).map(s => ({
      ...s,
      price: fieldData.price_per_hour,
      fieldName: fieldData.name
    }));

    return { slots, error: null };
  } catch (error) {
    console.error("Sinkronisasi Jadwal Gagal:", error);
    return { 
      slots: [], 
      error: error.message || "Gagal memuat jadwal matriks ketersediaan." 
    };
  }
}