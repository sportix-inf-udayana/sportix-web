export async function getAvailableSlots(supabase, venueId, dateStr) {
  try {
    // 1. Eksekusi Relational Query (INNER JOIN)
    // Mengambil SEMUA lapangan milik venue, beserta slotnya di tanggal tersebut
    const { data: fields, error } = await supabase
      .from('fields')
      .select(`
        id, 
        name, 
        price_per_hour,
        slots (
          id, 
          slot_date, 
          start_time, 
          end_time, 
          status, 
          locked_until
        )
      `)
      .eq('venue_id', venueId)
      .eq('slots.slot_date', dateStr)
      .neq('slots.status', 'BOOKED'); // Filter level 1: Buang yang sudah pasti terbeli

    if (error) throw error;
    if (!fields || fields.length === 0) {
      throw new Error("Venue ini belum memiliki lapangan atau slot aktif.");
    }

    const availableSlots = [];
    const currentTime = new Date().getTime();

    // 2. Filter level 2: Conflict Detection & Data Normalization
    fields.forEach(field => {
      // Pastikan slots ada, karena LEFT JOIN bisa mengembalikan array kosong
      const slots = field.slots || []; 
      
      slots.forEach(slot => {
        // RACE CONDITION DEFENSE: 
        // Jika slot sedang di-lock oleh user lain yang sedang di halaman pembayaran, abaikan.
        if (slot.locked_until) {
          const lockTime = new Date(slot.locked_until).getTime();
          if (lockTime > currentTime) return; // Slot masih terkunci, skip.
        }

        availableSlots.push({
          ...slot,
          price: field.price_per_hour,
          fieldName: field.name,
          fieldId: field.id
        });
      });
    });

    // 3. Sorting berdasarkan waktu mulai
    availableSlots.sort((a, b) => a.start_time.localeCompare(b.start_time));

    return { slots: availableSlots, error: null };
  } catch (error) {
    console.error("[VenueService] Sinkronisasi Jadwal Gagal:", error.message);
    return { 
      slots: [], 
      error: error.isOperational ? error.message : "Gagal memuat jadwal matriks ketersediaan." 
    };
  }
}