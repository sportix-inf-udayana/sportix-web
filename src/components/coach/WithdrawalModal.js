"use client";

import React, { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { X, Loader2, AlertCircle, Wallet } from "lucide-react";

// Inisiasi Supabase diletakkan di luar komponen untuk mencegah memory leak
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function WithdrawalModal({ isOpen, onClose, availableBalance, onActionSuccess }) {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("Bank BPD Bali");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedAmount = Number(amount);
    if (parsedAmount > availableBalance) {
      setErrorMsg("Nominal penarikan melebihi sisa saldo tersedia akun Anda.");
      return;
    }

    setLoading(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Sesi masuk habis. Silakan refresh browser Anda.");
      }

      const response = await fetch("/api/withdrawals/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          amount: parsedAmount,
          bankName: bankName,
          accountNumber: accountNumber.trim()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memproses pengajuan pencairan kas.");
      }

      alert(result.message || "Pengajuan dana dicatat sukses.");
      if (onActionSuccess) onActionSuccess();
      onClose();

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 relative text-white shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer bg-zinc-900 border border-zinc-800 p-1.5 rounded-full">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-brand-emerald">
            <Wallet className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300">Pencairan Saldo Kas</h3>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-[10px] font-mono tracking-widest uppercase text-red-400 flex items-start gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 -mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitWithdrawal} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">Nominal Penarikan (IDR)</label>
            <input
              type="number"
              required
              min={50000}
              disabled={loading}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Min. Rp 50,000"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-brand-emerald transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">Bank Tujuan</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-emerald transition-colors appearance-none font-sans cursor-pointer"
            >
              <option value="Bank BPD Bali">Bank BPD Bali</option>
              <option value="Bank Mandiri">Bank Mandiri</option>
              <option value="Bank BCA">Bank BCA</option>
              <option value="Bank BRI">Bank BRI</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">Nomor Rekening</label>
            <input
              type="text"
              required
              disabled={loading}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Masukkan nomor rekening aktif"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-brand-emerald transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !amount || !accountNumber.trim()}
            className="w-full bg-brand-emerald hover:bg-emerald-400 disabled:bg-zinc-800 text-black disabled:text-zinc-600 font-mono text-xs font-black tracking-widest uppercase py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] disabled:shadow-none mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>AJUKAN PENCAIRAN</span>}
          </button>
        </form>
      </div>
    </div>
  );
}