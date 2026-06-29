"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, Trash2, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export default function UmkmCatalogClient({ initialProducts = [] }) {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // DEFENSIVE FIX: Pastikan initialProducts selalu berupa array sebelum di-filter
  const safeProducts = Array.isArray(initialProducts) ? initialProducts : [];
  const filteredProducts = safeProducts.filter(p =>
    p?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (prod) => {
    const existing = cart.find(item => item.id === prod.id);
    if (existing) {
      if (existing.qty >= prod.stock) {
        alert("Kuantitas melebihi sisa stok fisik toko.");
        return;
      }
      setCart(cart.map(item =>
        item.id === prod.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      if (prod.stock < 1) return;
      setCart([...cart, { ...prod, qty: 1 }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const displayTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    try {
      const checkoutPayload = cart.map(item => ({
        productId: item.id,
        quantity: item.qty
      }));

      const response = await fetch("/api/umkm/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: checkoutPayload })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal menginisialisasi pembayaran.");
      }

      if (window.snap) {
         window.snap.pay(data.snapToken, {
            onSuccess: () => { 
              setCart([]); 
              setIsCartOpen(false); 
              router.push('/profile/history'); 
            },
            onPending: () => {
              alert("Menunggu pembayaran Anda.");
              setIsCartOpen(false);
            },
            onError: () => {
              alert("Pembayaran gagal. Silakan coba lagi.");
            },
            onClose: () => {
              alert("Anda menutup jendela pembayaran. Transaksi dibatalkan.");
            }
         });
      } else {
         throw new Error("Midtrans Snap.js tidak termuat di browser.");
      }

    } catch (error) {
      alert(error.message || "Terjadi kesalahan jaringan atau parameter manipulasi terdeteksi.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8 gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-brand-slate absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Cari peralatan lokal Bali..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-brand-slate/20 focus:border-brand-emerald rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-brand-slate outline-none transition-all font-sans"
          />
        </div>

        <button
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="bg-surface border border-brand-slate/20 hover:border-brand-slate/50 p-2.5 rounded-xl flex items-center gap-2 text-xs font-mono tracking-wider text-white cursor-pointer transition-colors"
        >
          <ShoppingBag className="w-4 h-4 text-brand-neon" />
          <span>CART ({cart.reduce((a, b) => a + b.qty, 0)})</span>
        </button>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-brand-slate/20 rounded-xl text-brand-slate font-mono text-sm">
          Katalog kosong atau produk tidak ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-surface-elevated border border-brand-slate/20 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-brand-emerald/50 transition-colors shadow-lg">
              <div className="h-44 bg-surface overflow-hidden relative">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="100vw"
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur border border-brand-slate/20 text-micro font-mono px-2 py-0.5 rounded text-white">
                  Stock: {p.stock}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-neon transition-colors font-display">{p.name}</h4>
                  <p className="text-tiny text-brand-slate leading-relaxed mt-1.5 mb-4 font-sans line-clamp-2">{p.desc}</p>
                </div>
                <div>
                  <div className="flex justify-between items-center border-t border-brand-slate/20 pt-3 mt-auto">
                    <div>
                      <span className="text-micro font-mono text-brand-slate block">HARGA RETAIL</span>
                      <span className="text-xs font-mono font-bold text-brand-neon block mt-0.5">Rp {Number(p.price || 0).toLocaleString("id-ID")}</span>
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.stock < 1}
                      className="bg-surface border border-brand-slate/20 hover:bg-brand-emerald hover:text-black hover:border-transparent text-white font-mono text-micro font-bold px-3 py-2 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {p.stock < 1 ? "HABIS" : "ADD TO CART"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface-elevated border-l border-brand-slate/20 h-full p-6 flex flex-col justify-between shadow-2xl relative slide-in-from-right-8">
            <button
              onClick={() => setIsCartOpen(false)}
              className="absolute top-6 right-6 text-xs font-mono text-brand-slate hover:text-white uppercase cursor-pointer"
            >
              [X] CLOSE
            </button>
            <div className="flex-1 overflow-y-auto pr-2 mt-8 scrollbar-none">
              <h3 className="text-sm font-mono text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-neon" /> Consignment Cart
              </h3>

              {cart.length === 0 ? (
                <div className="text-center py-12 text-brand-slate font-mono text-xs border border-dashed border-brand-slate/20 rounded-lg">
                  Keranjang Anda masih kosong.
                </div>
              ) : (
                <div className="space-y-4 font-sans">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-surface border border-brand-slate/20 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs shadow-sm">
                      <div className="flex-1">
                        <h5 className="font-bold text-white leading-none mb-1.5">{item.name}</h5>
                        <div className="flex items-center gap-2">
                          <span className="text-micro font-mono text-brand-neon font-bold">
                            Rp {Number(item.price || 0).toLocaleString("id-ID")}
                          </span>
                          <span className="text-micro font-mono text-brand-slate">x {item.qty}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-brand-slate hover:text-red-400 bg-surface border border-brand-slate/20 p-2 rounded transition-colors cursor-pointer"
                        title="Hapus item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-brand-slate/20 pt-5 mt-4 space-y-4 bg-surface-elevated">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-brand-slate uppercase">ESTIMASI SUBTOTAL</span>
                  <span className="text-brand-neon font-bold text-base">Rp {displayTotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="bg-brand-emerald/10 border border-brand-emerald/20 p-2.5 rounded text-micro font-mono text-brand-emerald flex items-center justify-center gap-2 uppercase">
                  <ShieldCheck className="w-4 h-4" /> 100% SECURE CASHLESS
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-brand-emerald hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-xs flex items-center justify-center gap-2 uppercase tracking-wider font-mono transition-all glow-emerald cursor-pointer disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>CHECKOUT SEKARANG</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}