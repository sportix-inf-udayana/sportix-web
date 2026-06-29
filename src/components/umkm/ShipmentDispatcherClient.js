"use client";

import React from "react";
import { Package } from "lucide-react";

export default function ShipmentDispatcherClient({ initialOrders = [] }) {
  const safeOrders = Array.isArray(initialOrders) ? initialOrders : [];
  
  return (
    <div className="bg-surface border border-zinc-800 rounded-xl p-6">
      <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
        Dispatcher Panel
      </h3>
      <div className="text-center py-12 text-zinc-500 font-mono text-xs border border-dashed border-zinc-800 rounded-lg">
        <Package className="w-8 h-8 mx-auto mb-3 text-zinc-600" />
        Modul Dispatcher siap diintegrasikan.
        <br/>
        Total Order Pending: {safeOrders.length}
      </div>
    </div>
  );
}