export async function getVenueById(supabase, venueId) {
  if (!venueId) return null;
  
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, description, price_per_hour, images, address, is_active')
    .eq('id', venueId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function getCustomerHistory(supabase, userId) {
  if (!userId) return [];
  
  const { data, error } = await supabase
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

  if (error) return [];
  return data || [];
}

export async function getUmkmProducts(supabase) {
  const { data, error } = await supabase
    .from('umkm_products')
    .select('id, name, description, price, image_url, stock, umkm_name')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function getTournaments(supabase) {
  const { data, error } = await supabase
    .from('tournaments')
    .select('id, title, description, start_date, end_date, registration_fee, status, banner_url')
    .order('start_date', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function getFeaturedVenues(supabase) {
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, address, price_per_hour, images, is_active')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) return [];
  return data || [];
}