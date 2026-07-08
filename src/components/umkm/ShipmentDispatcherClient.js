"use client";

import React, { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, Truck, AlertCircle, CheckCircle } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

// Deklarasi diluar scope komponen untuk efisiensi memori
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ShipmentDispatcherClient({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders || []);
  const [loadingId, setLoadingId] = useState(null);
  const [errorLog, setErrorLog] = useState(null);

  const handleDispatchOrder = async (orderId) => {
    setLoadingId(orderId);
    setErrorLog(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("Otorisasi terputus. Silakan lakukan penyegaran browser.");

      const response = await fetch("/api/umkm/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          orderId,
          targetStatus: "SHIPPED",
          courierName: "Sportix Cargo Logistics"
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal memperbarui manifes ekspedisi jualan.");

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "SHIPPED" } : o));
    } catch (err) {
      console.error(err);
      setErrorLog(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans text-white">
      {errorLog && (
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 font-mono text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>LOGISTICS_MUTATION_FAILURE: {errorLog}</span>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
          <Truck className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider">Manajemen Logistik & Pengiriman Toko</h3>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg text-zinc-500 text-xs font-mono">
            TIDAK ADA PESANAN MASUK YANG PERLU DIPROSES
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {orders.map((order) => {
              const isPreparing = order.status === "PREPARING";
              const isShipped = order.status === "SHIPPED";

              return (
                <div key={order.id} className="py-4 flex flex-col sm:flex-row justify-between items-center gap-4 first:pt-0 last:pb-0">
                  <div className="text-left w-full sm:w-auto font-mono text-xs">
                    <p className="text-white font-sans font-bold text-sm">
                      {order.umkm_products?.name || "Premium Sport Equips"}
                    </p>
                    <p className="text-zinc-500 mt-1">QTY: {order.quantity || 1} unit</p>
                    <p className="text-zinc-400 mt-0.5 truncate max-w-xs">ALAMAT: {order.delivery_address}</p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {isShipped ? (
                      <div className="flex items-center gap-1.5 text-xs text-purple-400 font-mono font-bold bg-purple-500/5 border border-purple-500/10 px-3 py-1.5 rounded-lg">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>TELAH DIKIRIM</span>
                      </div>
                    ) : (
                      <button
                        disabled={loadingId === order.id || !isPreparing}
                        onClick={() => handleDispatchOrder(order.id)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md",
                          (loadingId === order.id || !isPreparing) 
                            ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" 
                            : "bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                        )}
                      >
                        {loadingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                        <span>SERAHKAN KE KURIR</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}