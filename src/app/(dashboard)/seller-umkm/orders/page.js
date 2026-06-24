"use client";

import React, { useState } from "react";
import { 
  Briefcase, 
  Truck, 
  Layers, 
  MapPin, 
  Send,
  Loader2
} from "lucide-react";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([
    { id: "ORD-1042", product: "Velocity Strike Cleats", destination: "Jalan Legian No. 12, Kuta", courier: "Local Courier Wayan", status: "SHIPPED", date: "WE 24 Oct" },
    { id: "ORD-1043", product: "Match Pro Ball", destination: "Jalan Petitenget No. 8, Seminyak", courier: "Local Courier Made", status: "PENDING", date: "WE 24 Oct" },
    { id: "ORD-1044", product: "GripTech Gloves", destination: "Jalan Monkey Forest, Ubud", courier: "Unassigned", status: "PENDING", date: "TH 25 Oct" }
  ]);

  const [selectedOrderId, setSelectedOrderId] = useState("ORD-1043");
  const [courierName, setCourierName] = useState("");
  const [shippingStatus, setShippingStatus] = useState("SHIPPED");
  const [updating, setUpdating] = useState(false);

  const handleUpdateCourier = (e) => {
    e.preventDefault();
    if (!courierName) {
      alert("Harap masukkan nama kurir lokal!");
      return;
    }

    setUpdating(true);
    setTimeout(() => {
      setOrders(orders.map(o => {
        if (o.id === selectedOrderId) {
          return { ...o, courier: courierName, status: shippingStatus };
        }
        return o;
      }));
      setUpdating(false);
      setCourierName("");
      alert(`Status pengiriman ${selectedOrderId} berhasil diperbarui!`);
    }, 1200);
  };

  const navigateTo = (path) => {
    window.location.hash = path;
    if (window.__sportixNavigate) {
      window.__sportixNavigate(path);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans select-none">
      
      {/* Top Header & Navigation Switch */}
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
            <button 
              onClick={() => navigateTo("/seller-umkm/products")}
              className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>INVENTORY MGR</span>
            </button>
            <button 
              onClick={() => navigateTo("/seller-umkm/orders")}
              className="bg-surface-hover text-white px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-800"
            >
              <Truck className="w-3.5 h-3.5 text-purple-400" />
              <span>SHIPMENT ORDERS</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white font-display">Consignment Shipment Tracker</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Pantau rute dan status pengiriman barang olahraga konsinyasi di wilayah Bali. Tugaskan kurir lokal terpercaya untuk menjamin pengantaran tepat waktu.
          </p>
        </div>

        {/* Dual Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Shipment Table (8 Columns) */}
          <div className="lg:col-span-8 bg-surface border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-purple-400" /> ACTIVE SHIPMENTS TRAIL
            </h3>

            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id}
                  className="bg-surface-elevated border border-zinc-800/80 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-zinc-700 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-brand-neon">
                        {order.id}
                      </span>
                      <span className="text-micro font-mono text-zinc-500">{order.date}</span>
                      <span className={`text-micro font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        order.status === "PENDING" ? "bg-brand-amber/15 text-brand-amber border border-brand-amber/20" : "bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/20"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-2">
                      {order.product}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{order.destination}</span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0 w-full md:w-auto">
                    <span className="text-micro font-mono text-zinc-500 block uppercase">LOCAL COURIER</span>
                    <span className="text-xs font-bold text-white mt-1">{order.courier}</span>
                    <button 
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setCourierName(order.courier === "Unassigned" ? "" : order.courier);
                        setShippingStatus(order.status);
                      }}
                      className="text-micro font-mono text-purple-400 hover:underline mt-2 cursor-pointer"
                    >
                      MANAGE SHIPMENT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Local Courier Dispatch form (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
                LOCAL COURIER DISPATCHER
              </h3>

              <form onSubmit={handleUpdateCourier} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-zinc-500 block mb-1 uppercase text-micro">
                    SELECT ORDER ID
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full bg-surface-elevated border border-zinc-800 focus:border-purple-500 rounded-lg py-2 px-3 text-foreground outline-none"
                  >
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} - {o.product}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-500 block mb-1 uppercase text-micro">
                    COURIER NAME
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Local Courier Wayan"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full bg-surface-elevated border border-zinc-800 focus:border-purple-500 rounded-lg py-2.5 px-3 text-foreground outline-none placeholder-zinc-700 font-sans"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 block mb-1 uppercase text-micro">
                    DELIVERY STATUS
                  </label>
                  <select
                    value={shippingStatus}
                    onChange={(e) => setShippingStatus(e.target.value)}
                    className="w-full bg-surface-elevated border border-zinc-800 focus:border-purple-500 rounded-lg py-2 px-3 text-foreground outline-none"
                  >
                    <option value="PENDING">PENDING (Prepared)</option>
                    <option value="SHIPPED">SHIPPED (En Route)</option>
                    <option value="DELIVERED">DELIVERED (Completed)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 uppercase tracking-wider transition-all"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Update Courier Trail</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}