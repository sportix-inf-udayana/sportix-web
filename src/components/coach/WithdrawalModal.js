"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, X } from "lucide-react";

export default function WithdrawalModal({ isOpen, onClose, maxBalance }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(amount) > maxBalance) {
      alert("Nominal penarikan melebihi saldo tersedia.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/withdrawals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), bankName, accountNumber })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        alert(data.message);
        router.refresh(); // Sinkronisasi ulang SSR
        onClose();
      } else {
        alert(data.message || "Gagal mengajukan penarikan.");
      }
    } catch (err) {
      alert("Kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-surface-elevated border border-zinc-800 rounded-2xl p-6 w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-neon/10 flex items-center justify-center text-brand-neon">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold font-display">Tarik Saldo</h3>
            <p className="text-zinc-400 text-xs font-mono">Max: Rp {maxBalance.toLocaleString("id-ID")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-micro font-mono text-zinc-500 uppercase block mb-1">Nominal (Rp)</label>
            <input 
              type="number" 
              required
              max={maxBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-neon transition-colors font-mono"
              placeholder="Contoh: 500000"
            />
          </div>
          <div>
            <label className="text-micro font-mono text-zinc-500 uppercase block mb-1">Nama Bank (Kode)</label>
            <input 
              type="text" 
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-neon transition-colors"
              placeholder="Contoh: BCA / MANDIRI / BNI"
            />
          </div>
          <div>
            <label className="text-micro font-mono text-zinc-500 uppercase block mb-1">Nomor Rekening</label>
            <input 
              type="text" 
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-surface border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-brand-neon transition-colors font-mono"
              placeholder="1234567890"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || Number(amount) <= 0 || Number(amount) > maxBalance}
            className="w-full bg-brand-neon hover:bg-brand-emerald text-black font-black py-3 rounded-lg mt-4 transition-all uppercase tracking-wider font-mono text-sm disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(78,222,163,0.2)]"
          >
            {loading ? "MEMPROSES..." : "AJUKAN PENARIKAN"}
          </button>
        </form>
      </div>
    </div>
  );
}