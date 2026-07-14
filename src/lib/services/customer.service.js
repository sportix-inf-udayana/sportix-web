import { supabase } from '@/lib/supabase'; // Asumsi klien standar atau SSR terintegrasi

export async function getVenueById(venueId) {
  if (!venueId) return null;

  try {
    const { data, error } = await supabase
      .from('venues')
      .select('id, name, description, price_per_hour, images, address, is_active')
      .eq('id', venueId)
      .single();

    if (error) {
      console.error(`[Service Error] getVenueById: ${error.message}`);
      return null;
    }

    // Sanitasi data yang tidak aktif
    if (!data?.is_active) return null;

    return data;
  } catch (err) {
    console.error(`[Service Exception] getVenueById:`, err);
    return null;
  }
}

export async function getCustomerHistory(supabaseServerClient, userId) {
  if (!userId) return [];

  try {
    const { data, error } = await supabaseServerClient
      .from('bookings')
      .select(`
        id,
        booking_date,
        total_price,
        status,
        venues ( name, address ),
        slots ( start_time, end_time )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Service Error] getCustomerHistory:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Service Exception] getCustomerHistory:', err);
    return [];
  }
}

export async function getUmkmProducts(supabaseServerClient) {
  try {
    const { data, error } = await supabaseServerClient
      .from('umkm_products') // Sesuaikan dengan nama tabel aslimu
      .select('id, name, description, price, image_url, stock, umkm_name')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Service Error] getUmkmProducts:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Service Exception] getUmkmProducts:', err);
    return [];
  }
}

export async function getTournaments(supabaseServerClient) {
  try {
    const { data, error } = await supabaseServerClient
      .from('tournaments') // Sesuaikan dengan nama tabel aslimu
      .select('id, title, description, start_date, end_date, registration_fee, status, banner_url')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('[Service Error] getTournaments:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Service Exception] getTournaments:', err);
    return [];
  }
}

export async function getFeaturedVenues(supabaseServerClient) {
  try {
    // Asumsi: Kita mengambil 4 venue terbaru yang aktif. 
    // Jika di databasemu ada kolom 'is_featured' atau 'rating', ubah query ini agar lebih relevan.
    const { data, error } = await supabaseServerClient
      .from('venues')
      .select('id, name, address, price_per_hour, images, is_active')
      .eq('is_active', true)
      // .eq('is_featured', true) // Buka komentar ini jika skema DB mendukung
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) {
      console.error('[Service Error] getFeaturedVenues:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[Service Exception] getFeaturedVenues:', err);
    return [];
  }
}