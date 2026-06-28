import React from "react";
import Link from "next/link";
import { Briefcase, Truck, Layers } from "lucide-react";

export default function UmkmHeader({ activeRoute }) {
  return (
    <div className="border-b border-zinc-800 bg-surface-elevated sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <span className="text-micro font-mono text-zinc-500 block leading-none">MERCHANT PORTAL</span>
            <h2 className="text-base font-black text-white font-display">UMKM Seller Portal</h2>
          </div>
        </div>

        <div className="flex bg-surface border border-zinc-800/80 p-1 rounded-lg">
          <Link 
            href="/seller-umkm/products"
            className={`${activeRoute === 'products' ? 'bg-surface-hover text-white border border-zinc-800' : 'text-zinc-500 hover:text-zinc-300'} px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors`}
          >
            <Layers className={`w-3.5 h-3.5 ${activeRoute === 'products' ? 'text-purple-400' : ''}`} />
            <span>INVENTORY MGR</span>
          </Link>
          <Link 
            href="/seller-umkm/orders"
            className={`${activeRoute === 'orders' ? 'bg-surface-hover text-white border border-zinc-800' : 'text-zinc-500 hover:text-zinc-300'} px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors`}
          >
            <Truck className={`w-3.5 h-3.5 ${activeRoute === 'orders' ? 'text-purple-400' : ''}`} />
            <span>SHIPMENT ORDERS</span>
          </Link>
        </div>
      </div>
    </div>
  );
}