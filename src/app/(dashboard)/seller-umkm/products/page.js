/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (dashboard)
 * Path: src/app/(dashboard)/seller-umkm/products/page.js
 * Deskripsi SRS: 
 * Panel manajemen katalog bagi pelaku usaha UMKM lokal Bali. Berfungsi untuk menambahkan komoditas produk baru, 
 * memantau kuantitas stok barang fisik yang dititipkan pada pro-shop, mengubah harga, serta memantau data 
 * ketetapan margin konsinyasi bagi pihak venue.
 */

"use client";

import React, { useState } from "react";
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Tag, 
  ShoppingBag,
  Truck,
  Layers,
  ArrowRight
} from "lucide-react";

export default function SellerProductsPage() {
  const [products, setProducts] = useState([
    { id: "prod-1", name: "Velocity Strike Cleats", price: 2450000, stock: 12, category: "Shoes" },
    { id: "prod-2", name: "AeroCore Jersey Home", price: 850000, stock: 45, category: "Apparel" },
    { id: "prod-3", name: "Match Pro Ball", price: 1200000, stock: 2, category: "Gear" },
    { id: "prod-4", name: "GripTech Gloves", price: 450000, stock: 28, category: "Gear" }
  ]);

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newCategory, setNewCategory] = useState("Gear");
  const [adding, setAdding] = useState(false);

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newName || !newPrice || !newStock) {
      alert("Harap isi semua kolom untuk menambahkan produk baru!");
      return;
    }

    setAdding(true);
    setTimeout(() => {
      const newProduct = {
        id: `prod-${Date.now()}`,
        name: newName,
        price: parseFloat(newPrice),
        stock: parseInt(newStock),
        category: newCategory
      };
      setProducts([...products, newProduct]);
      setNewName("");
      setNewPrice("");
      setNewStock("");
      setAdding(false);
    }, 1000);
  };

  const handleUpdateStock = (id, delta) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        return { ...p, stock: Math.max(0, p.stock + delta) };
      }
      return p;
    }));
  };

  const handleRemoveProduct = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk konsinyasi ini?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const navigateTo = (path) => {
    window.location.hash = path;
    if (window.__sportixNavigate) {
      window.__sportixNavigate(path);
    }
  };

  return (
    <div className="bg-[#09090b] text-[#e5e2e1] min-h-screen pb-16 font-sans select-none">
      
      {/* Top Header & Navigation Switch */}
      <div className="border-b border-zinc-800 bg-[#0e0e0e] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 block leading-none">MERCHANT PORTAL</span>
              <h2 className="text-base font-black text-white">UMKM Seller Portal</h2>
            </div>
          </div>

          <div className="flex bg-[#131313] border border-zinc-800/80 p-1 rounded-lg">
            <button 
              onClick={() => navigateTo("/seller-umkm/products")}
              className="bg-[#1c1b1b] text-white px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-800"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>INVENTORY MGR</span>
            </button>
            <button 
              onClick={() => navigateTo("/seller-umkm/orders")}
              className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>SHIPMENT ORDERS</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">Inventory Management</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Katalog pengontrol pasokan barang olahraga lokal di Bali. Pasok stok baru, ubah harga jual, dan kelola listing konsinyasi Anda secara instan.
          </p>
        </div>

        {/* Dual Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Active Inventory Catalogue controller table (8 Columns) */}
          <div className="lg:col-span-8 bg-[#131313] border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-purple-400" /> ACTIVE CONSIGNMENT GOODS ({products.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 font-mono text-zinc-500 uppercase">
                    <th className="pb-3 font-semibold">Produk</th>
                    <th className="pb-3 font-semibold">Kategori</th>
                    <th className="pb-3 font-semibold">Harga Konsinyasi</th>
                    <th className="pb-3 font-semibold text-center">Stok</th>
                    <th className="pb-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#18181b]/40">
                      <td className="py-4 font-sans font-bold text-white pr-2">
                        {p.name}
                      </td>
                      <td className="py-4 text-zinc-400">
                        {p.category}
                      </td>
                      <td className="py-4 text-purple-400 font-bold">
                        Rp {p.price.toLocaleString("id-ID")}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleUpdateStock(p.id, -1)}
                            className="w-5 h-5 bg-[#0e0e0e] border border-zinc-800 rounded text-zinc-400 font-bold flex items-center justify-center hover:border-zinc-700 transition-all"
                          >
                            -
                          </button>
                          <span className="text-white font-bold w-6 text-center">{p.stock}</span>
                          <button 
                            onClick={() => handleUpdateStock(p.id, 1)}
                            className="w-5 h-5 bg-[#0e0e0e] border border-zinc-800 rounded text-zinc-400 font-bold flex items-center justify-center hover:border-zinc-700 transition-all"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleRemoveProduct(p.id)}
                          className="text-zinc-600 hover:text-red-400 p-1.5 transition-colors"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add New Consignment Product (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-1">
                <Plus className="w-4 h-4" /> ADD CONSIGNMENT GOODS
              </h3>

              <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1 uppercase tracking-wide font-mono text-[10px]">
                    Nama Produk Olahraga
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Strike Jersey Black"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-[#0e0e0e] border border-zinc-800 focus:border-purple-500 rounded-lg py-2 px-3 text-[#e5e2e1] outline-none placeholder-zinc-700"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 uppercase tracking-wide font-mono text-[10px]">
                    Kategori
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#0e0e0e] border border-zinc-800 focus:border-purple-500 rounded-lg py-2 px-3 text-[#e5e2e1] outline-none"
                  >
                    <option value="Shoes">Shoes</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Gear">Gear</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 uppercase tracking-wide font-mono text-[10px]">
                    Harga Konsinyasi (Rupiah)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 850000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-[#0e0e0e] border border-zinc-800 focus:border-purple-500 rounded-lg py-2 px-3 text-[#e5e2e1] outline-none placeholder-zinc-700 font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 uppercase tracking-wide font-mono text-[10px]">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 20"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-[#0e0e0e] border border-zinc-800 focus:border-purple-500 rounded-lg py-2 px-3 text-[#e5e2e1] outline-none placeholder-zinc-700 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adding}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 uppercase tracking-wider font-mono transition-all"
                >
                  {adding ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Tambahkan Listing</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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