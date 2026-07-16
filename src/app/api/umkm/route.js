// src/app/api/umkm/route.js
import { withAuthAndCatch } from '@/lib/api-wrapper';
import { ENTITY_STATUS } from '@/lib/constants';

export const GET = withAuthAndCatch(async (req, { supabase }) => {
  const { data, error } = await supabase
    .from('umkm_products')
    .select('id, name, price, stock, umkm_stores!inner(name, status)')
    .eq('is_active', true)
    .eq('umkm_stores.status', ENTITY_STATUS.APPROVED);

  if (error) throw error;
  return data || [];
});