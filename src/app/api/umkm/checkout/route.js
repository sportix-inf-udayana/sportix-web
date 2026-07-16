// src/app/api/umkm/checkout/route.js
import { z } from 'zod';
import { withAuthAndCatch } from '@/lib/api-wrapper';
import { UmkmService } from '@/lib/services/umkm.service';

const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive()
  })).min(1),
  deliveryAddress: z.string().optional()
});

export const POST = withAuthAndCatch(async (req, { supabase, user }) => {
  const payload = checkoutSchema.parse(await req.json());
  
  return await UmkmService.processCheckout({
    supabase,
    user,
    items: payload.items,
    deliveryAddress: payload.deliveryAddress?.trim() || 'Ambil di Pro-Shop Venue (Pick-Up)'
  });
});