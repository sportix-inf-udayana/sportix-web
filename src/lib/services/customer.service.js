// src/lib/services/customer.service.js
import { ENTITY_STATUS } from '@/lib/constants';

export async function getVenueById(supabase, venueId) {
  if (!venueId) return null;
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, description, price_per_hour, images, address, is_active, status, fields(id, name, sport_type)')
    .eq('id', venueId)
    .eq('is_active', true)
    .eq('status', ENTITY_STATUS.APPROVED)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function getCustomerHistory(supabase, userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      booking_date,
      total_price,
      status,
      payment_gateway_ref,
      venues ( name, address ),
      venue_slots ( start_time, end_time, day_of_week )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function getUmkmProducts(supabase) {
  const { data, error } = await supabase
    .from('umkm_products')
    .select('id, name, description, price, image_url, stock, umkm_stores!inner(name, status)')
    .eq('is_active', true)
    .eq('umkm_stores.status', ENTITY_STATUS.APPROVED)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function getTournaments(_supabase) {
  return [];
}

export async function getFeaturedVenues(supabase) {
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, address, price_per_hour, images, is_active, status, sport, rating')
    .eq('is_active', true)
    .eq('status', ENTITY_STATUS.APPROVED)
    .order('rating', { ascending: false })
    .limit(4);

  if (error) return [];
  return data || [];
}