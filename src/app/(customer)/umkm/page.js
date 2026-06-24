/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (customer)
 * Path: src/app/(customer)/umkm/page.js
 * Deskripsi SRS: 
 * Katalog e-commerce komersial terpadu produk-produk olahraga buatan lokal UMKM Bali. Menangani display produk kerajinan, 
 * apparel olahraga, atau raket/bola yang dititipkan secara konsinyasi fisik pada toko fisik pro-shop venue yang bermitra.
 */

"use client";

import React, { useState } from "react";
import {
  Award,
  ShoppingBag,
  Search,
  DollarSign,
  CheckCircle2,
  Trash2,
  Tag,
  ArrowRight
} from "lucide-react";

export default function UmkmConsignmentPage() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");

  const products = [
    {
      id: "prod-1",
      name: "Velocity Strike Cleats",
      price: 2450000,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400", // Nike red shoe style
      stock: 12,
      desc: "Sepatu futsal elite berdaya cengkeram tinggi untuk manuver eksplosif di lapangan sintetis."
    },
    {
      id: "prod-2",
      name: "AeroCore Jersey Home",
      price: 850000,
      image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=400", // Jersey sport style
      stock: 45,
      desc: "Jersey serat karbon berpori ultra-ringan dengan penyerapan keringat instan."
    },
    {
      id: "prod-3",
      name: "Match Pro Ball",
      price: 1200000,
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=400", // Futsal ball
      stock: 2,
      desc: "Bola kompetisi resmi berbobot mantap dengan pantulan presisi bersertifikat."
    },
    {
      id: "prod-4",
      name: "GripTech Gloves",
      price: 450000,
      image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=400", // Athlete gloves/hand protector
      stock: 28,
      desc: "Sarung tangan anti-slip silikon tinggi, ideal untuk performa grip maksimal."
    }
  ];

  const filteredProducts = products.filter(p =>
  p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (prod) => {
    const existing = cart.find(item => item.id === prod.id);
    if (existing) {
      setCart(cart.map(item =>
      item.id === prod.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, { ...prod, qty: 1 }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleCheckout = () => {
    alert("Checkout Cashless Terkonfirmasi! Pembelian Anda sedang diproses oleh UMKM Seller Portal.");
    setCart([]);
    setIsCartOpen(false);
  };

  const navigateBack = () => {
    window.location.hash = "/profile/history";
    if (window.__sportixNavigate) {
      window.__sportixNavigate("/profile/history");
    }
  };

  return (
    <div className="bg-[#09090b] text-[#e5e2e1] min-h-screen pb-16 font-sans select-none relative">

    {/* Header Container */}
    <div className="border-b border-zinc-800 bg-[#0e0e0e] py-6 px-6">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
    <div className="flex items-center gap-3.5">
    <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 glow-emerald">
    <Award className="w-5 h-5" />
    </div>
    <div>
    <h1 className="text-2xl font-black text-white font-display">Athlete Dossier</h1>
    <p className="text-zinc-500 text-xs uppercase tracking-wider font-mono">
    Manage your competitive history and active passes
    </p>
    </div>
    </div>
    <button
    onClick={navigateBack}
    className="text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3.5 py-2 rounded text-zinc-400 hover:text-white transition-all cursor-pointer font-sans font-medium"
    >
    Kembali ke Dossier
    </button>
    </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 mt-8">
    {/* Navigation Tabs */}
    <div className="flex border-b border-zinc-800/80 gap-6 mb-8">
    <button
    onClick={navigateBack}
    className="pb-4 text-sm font-semibold text-zinc-500 hover:text-zinc-300 cursor-pointer"
    >
    My Tickets
    </button>
    <button
    onClick={() => {
      window.location.hash = "/tournaments";
      if (window.__sportixNavigate) {
        window.__sportixNavigate("/tournaments");
      }
    }}
    className="pb-4 text-sm font-semibold text-zinc-500 hover:text-zinc-300 cursor-pointer"
    >
    Tournaments
    </button>
    <button className="pb-4 text-sm font-bold text-emerald-400 relative">
    Consignment Pro Shop
    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 glow-emerald" />
    </button>
    </div>

    {/* Search & Cart Trigger */}
    <div className="flex justify-between items-center mb-8 gap-4">
    <div className="relative max-w-sm flex-1">
    <Search className="w-4 h-4 text-zinc-600 absolute left-3.5 top-3.5" />
    <input
    type="text"
    placeholder="Cari peralatan lokal Bali..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full bg-[#131313] border border-zinc-800 focus:border-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-700 outline-none transition-all font-sans"
    />
    </div>

    <button
    onClick={() => setIsCartOpen(!isCartOpen)}
    className="bg-[#131313] border border-zinc-800 hover:border-zinc-700 p-2.5 rounded-xl flex items-center gap-2 text-xs font-mono tracking-wider text-white cursor-pointer"
    >
    <ShoppingBag className="w-4 h-4 text-emerald-400" />
    <span>CART ({cart.reduce((a, b) => a + b.qty, 0)})</span>
    </button>
    </div>

    {/* Products Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {filteredProducts.map((p) => (
      <div key={p.id} className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between group">
      <div className="h-44 bg-zinc-950 overflow-hidden relative">
      <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
      <span className="absolute bottom-3 right-3 bg-black/80 border border-zinc-800 text-[10px] font-mono px-2 py-0.5 rounded text-zinc-400">
      Stock: {p.stock}
      </span>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
      <div>
      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors font-display">{p.name}</h4>
      <p className="text-[11px] text-zinc-500 leading-relaxed mt-1.5 mb-4 font-sans">{p.desc}</p>
      </div>
      <div>
      <div className="flex justify-between items-center border-t border-zinc-800/60 pt-3 mt-auto">
      <div>
      <span className="text-[9px] font-mono text-zinc-500 block">HARGA KONSINYASI</span>
      <span className="text-xs font-mono font-bold text-emerald-400">Rp {p.price.toLocaleString("id-ID")}</span>
      </div>
      <button
      onClick={() => addToCart(p)}
      className="bg-zinc-800 hover:bg-emerald-500 hover:text-black border border-zinc-700 hover:border-transparent text-zinc-300 font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:glow-emerald"
      >
      ADD TO CART
      </button>
      </div>
      </div>
      </div>
      </div>
    ))}
    </div>
    </div>

    {/* Cart Drawer */}
    {isCartOpen && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-sm glass-panel border-l border-zinc-800 h-full p-6 flex flex-col justify-between shadow-2xl relative">
      <button
      onClick={() => setIsCartOpen(false)}
      className="absolute top-4 right-4 text-xs font-mono text-zinc-500 hover:text-white uppercase cursor-pointer"
      >
      Close [X]
      </button>
      <div className="flex-1 overflow-y-auto pr-2 mt-8">
      <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
      <ShoppingBag className="w-4 h-4 text-emerald-400" /> Shopping Cart
      </h3>

      {cart.length === 0 ? (
        <div className="text-center py-12 text-zinc-600 font-mono text-xs">
        Keranjang belanja masih kosong.
        </div>
      ) : (
        <div className="space-y-4 font-sans">
        {cart.map((item) => (
          <div key={item.id} className="bg-[#0e0e0e] border border-zinc-800/80 p-3 rounded-lg flex items-center justify-between gap-3 text-xs">
          <div className="flex-1">
          <h5 className="font-bold text-white leading-none mb-1">{item.name}</h5>
          <span className="text-[10px] font-mono text-emerald-400">
          Rp {item.price.toLocaleString("id-ID")} x {item.qty}
          </span>
          </div>
          <button
          onClick={() => removeFromCart(item.id)}
          className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
          >
          <Trash2 className="w-4 h-4" />
          </button>
          </div>
        ))}
        </div>
      )}
      </div>

      {cart.length > 0 && (
        <div className="border-t border-zinc-800/80 pt-4 mt-4 space-y-4">
        <div className="flex justify-between items-center text-xs font-mono">
        <span className="text-zinc-500 uppercase">SUBTOTAL</span>
        <span className="text-emerald-400 font-bold text-sm">Rp {cartTotal.toLocaleString("id-ID")}</span>
        </div>
        <div className="bg-[#18181b] border border-zinc-800 p-2.5 rounded text-[10px] font-mono text-zinc-500 uppercase text-center">
        🔐 100% SECURE CASHLESS SYSTEM
        </div>
        <button
        onClick={handleCheckout}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-xs flex items-center justify-center gap-2 uppercase tracking-wider font-mono transition-all glow-emerald cursor-pointer"
        >
        <span>Checkout Cashless</span>
        <ArrowRight className="w-4 h-4" />
        </button>
        </div>
      )}
      </div>
      </div>
    )}
    </div>
  );
}
