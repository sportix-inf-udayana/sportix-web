// src/app/api/umkm/orders/route.js
import { z } from 'zod';
import { withAuthAndCatch, AppError } from '@/lib/api-wrapper';
import { USER_ROLES } from '@/lib/constants';

export const GET = withAuthAndCatch(async (req, { supabase, user }) => {
  const role = user.user_metadata?.role || USER_ROLES.CUSTOMER;
  
  let query = supabase
    .from('umkm_orders')
    .select('id, status, courier_name, delivery_address, total_price, created_at, quantity, umkm_products(name, price)')
    .order('created_at', { ascending: false });

  if (role === USER_ROLES.UMKM_SELLER) {
    const { data: store } = await supabase.from('umkm_stores').select('id').eq('owner_id', user.id).maybeSingle();
    if (!store) return [];
    query = query.eq('store_id', store.id);
  } else {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
});

const patchOrderSchema = z.object({
  orderId: z.string().uuid(),
  targetStatus: z.string().min(3),
  courierName: z.string().optional()
});

export const PATCH = withAuthAndCatch(async (req, { supabase, user }) => {
  if (user.user_metadata?.role !== USER_ROLES.UMKM_SELLER) {
    throw new AppError('Forbidden. Akses khusus penjual UMKM.', 403);
  }

  const payload = patchOrderSchema.parse(await req.json());
  const { data: store } = await supabase.from('umkm_stores').select('id').eq('owner_id', user.id).maybeSingle();
  
  if (!store) throw new AppError('Profil toko tidak ditemukan.', 403);

  const { data, error } = await supabase
    .from('umkm_orders')
    .update({
      status: payload.targetStatus,
      courier_name: payload.courierName?.trim() || 'Kurir Pengantar Lokal'
    })
    .eq('id', payload.orderId)
    .eq('store_id', store.id)
    .select()
    .single();

  if (error || !data) {
    throw new AppError('Gagal memperbarui status. Order tidak ditemukan atau bukan milik toko ini.', 409);
  }

  return { message: 'Manifes status logistik diperbarui.' };
});