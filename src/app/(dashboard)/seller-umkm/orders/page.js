import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Truck, MapPin, PackageOpen } from "lucide-react";

import { getUmkmOrders } from "../../../../lib/services/umkm.service";
import UmkmHeader from "../../../../components/umkm/UmkmHeader";
import ShipmentDispatcherClient from "../../../../components/umkm/ShipmentDispatcherClient";

export const dynamic = 'force-dynamic';

export default async function SellerOrdersPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return <div className="p-8 text-red-500 font-mono">Akses Ditolak.</div>;

  // Eksekusi Data Layer Terpusat
  const { store, orders } = await getUmkmOrders(supabase, user.id);

  if (!store) return <div className="p-8 text-red-500 font-mono">Toko UMKM tidak ditemukan.</div>;

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans select-none">
      
      {/* Penggunaan Header Komponen Eksternal */}
      <UmkmHeader activeRoute="orders" />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white font-display">Consignment Shipment Tracker</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Data pesanan disinkronisasi langsung dari server produksi. Tugaskan kurir lokal terpercaya untuk menjamin pengantaran tepat waktu ke pelanggan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Shipment Table (8 Columns) - SSR Rendered */}
          <div className="lg:col-span-8 bg-surface border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-purple-400" /> ACTIVE SHIPMENTS TRAIL (LIVE)
            </h3>

            {orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-surface-elevated border border-zinc-800/80 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-zinc-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-brand-neon">
                          {order.id.substring(0,8).toUpperCase()}...
                        </span>
                        <span className="text-micro font-mono text-zinc-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span className={`text-micro font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          order.status === "PENDING" ? "bg-brand-amber/15 text-brand-amber border border-brand-amber/20" : "bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/20"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-2">
                        {order.umkm_products?.name || "Produk Tidak Ditemukan"}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{order.delivery_address}</span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0 w-full md:w-auto">
                      <span className="text-micro font-mono text-zinc-500 block uppercase">LOCAL COURIER</span>
                      <span className="text-xs font-bold text-white mt-1">{order.courier_name || "Unassigned"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-zinc-800 border-dashed rounded-lg">
                <PackageOpen className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500 font-mono text-sm">Belum ada pesanan yang masuk ke toko Anda.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <ShipmentDispatcherClient initialOrders={orders || []} />
          </div>

        </div>
      </div>
    </div>
  );
}