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
      setCart(cart.map(item => item.id === prod.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      if (prod.stock < 1) return;
      setCart([...cart, { ...prod, qty: 1 }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const displayTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    
    try {
      const checkoutPayload = cart.map(item => ({ productId: item.id, quantity: item.qty }));
      
      const response = await fetch("/api/umkm/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: checkoutPayload })
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || resData.message || "Gagal menginisialisasi pembayaran.");
      }
      
      const snapToken = resData.data?.snapToken || resData.snapToken;

      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: () => { 
            setCart([]); 
            setIsCartOpen(false); 
            router.push('/profile/history'); 
          },
          onPending: () => { 
            alert("Menunggu pembayaran Anda."); 
            setIsCartOpen(false); 
            router.push('/profile/history');
          },
          onError: () => {
            alert("Pembayaran gagal. Silakan coba lagi.");
            setIsCheckingOut(false);
          },
          onClose: () => {
            alert("Anda menutup jendela pembayaran. Transaksi dibatalkan.");
            setIsCheckingOut(false);
          }
        });
      } else {
        throw new Error("Midtrans Snap.js tidak termuat di browser.");
      }
    } catch (error) {
      alert(error.message || "Terjadi kesalahan jaringan atau parameter manipulasi terdeteksi.");
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="font-sans">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Cari perlengkapan lokal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-brand-emerald rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-all"
          />
        </div>
        <button
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="w-full md:w-auto bg-zinc-900 border border-zinc-800 hover:border-brand-emerald hover:text-white p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-mono font-bold tracking-widest text-zinc-400 transition-colors shadow-sm"
        >
          <ShoppingBag className="w-4 h-4 text-brand-emerald" />
          <span>KERANJANG ({cart.reduce((a, b) => a + b.qty, 0)})</span>
        </button>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 font-mono text-xs uppercase tracking-widest">
          Katalog kosong atau produk tidak ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-brand-emerald/50 transition-colors shadow-xl">
              <div className="h-48 bg-zinc-950 overflow-hidden relative">
                <Image
                  src={p.image_url || p.image || "/image/hero-arena.jpg"}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-3 right-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[10px] font-mono px-2 py-1 rounded text-white tracking-widest uppercase">
                  Stock: {p.stock}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-brand-emerald transition-colors font-display line-clamp-1">{p.name}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-2 mb-4 font-sans line-clamp-2">{p.description || p.desc}</p>
                </div>
                <div>
                  <div className="flex justify-between items-center border-t border-zinc-800/60 pt-4 mt-auto">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-widest">Harga Retail</span>
                      <span className="text-sm font-mono font-bold text-white block mt-1">Rp {Number(p.price || 0).toLocaleString("id-ID")}</span>
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.stock < 1}
                      className="bg-zinc-950 border border-zinc-800 hover:bg-brand-emerald hover:text-black hover:border-brand-emerald text-white font-mono text-[10px] font-bold px-4 py-2.5 rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      {p.stock < 1 ? "HABIS" : "ADD"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full p-6 flex flex-col justify-between shadow-2xl relative slide-in-from-right-8">
            <button
              onClick={() => setIsCartOpen(false)}
              className="absolute top-6 right-6 text-[10px] font-mono font-bold tracking-widest text-zinc-500 hover:text-white uppercase transition-colors"
            >
              [X] CLOSE
            </button>
            <div className="flex-1 overflow-y-auto pr-2 mt-8 scrollbar-none">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-emerald" /> Consignment Cart
              </h3>
              
              {cart.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 font-mono text-xs border border-dashed border-zinc-800 rounded-xl uppercase tracking-widest">
                  Keranjang Anda Kosong
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between gap-3 shadow-md">
                      <div className="flex-1">
                        <h5 className="font-bold text-sm text-white leading-none mb-2">{item.name}</h5>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-white font-bold">
                            Rp {Number(item.price || 0).toLocaleString("id-ID")}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">x {item.qty}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-zinc-500 hover:text-red-400 bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg transition-colors shadow-sm"
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
              <div className="border-t border-zinc-800 pt-6 mt-4 space-y-5 bg-zinc-950">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">ESTIMASI SUBTOTAL</span>
                  <span className="text-brand-emerald font-bold text-lg">Rp {displayTotal.toLocaleString("id-ID")}</span>
                </div>
                
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-[10px] font-mono font-bold tracking-widest text-brand-emerald flex items-center justify-center gap-2 uppercase">
                  <ShieldCheck className="w-4 h-4" /> 100% SECURE CASHLESS
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-brand-emerald hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-xs flex items-center justify-center gap-2 uppercase tracking-widest font-mono transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
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
    </div>
  );
}