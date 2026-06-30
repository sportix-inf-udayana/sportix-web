"use client";

import React, { useState, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { X, Loader2, AlertCircle, Wallet } from "lucide-react";

export default function WithdrawalModal({ isOpen, onClose, availableBalance, onActionSuccess }) {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("Bank BPD Bali");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), []);

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
      // FIX: Ambil sesi otentikasi user pelatih/penjual untuk disuntikkan ke dalam header request
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-xl p-6 relative text-white font-sans shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
          <Wallet className="w-4 h-4 text-brand-emerald" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider">Form Pencairan Saldo Kas</h3>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-mono text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
          <div className="space-y-1">
            <label className="text-micro font-mono text-zinc-500 uppercase block">Nominal Penarikan (IDR)</label>
            <input
              type="number"
              required
              min={50000}
              disabled={loading}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Min. Rp 50,000"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div className="space-y-1">
            <label className="text-micro font-mono text-zinc-500 uppercase block">Bank Tujuan</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-emerald"
            >
              <option value="Bank BPD Bali">Bank BPD Bali</option>
              <option value="Bank Mandiri">Bank Mandiri</option>
              <option value="Bank BCA">Bank BCA</option>
              <option value="Bank BRI">Bank BRI</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-micro font-mono text-zinc-500 uppercase block">Nomor Rekening</label>
            <input
              type="text"
              required
              disabled={loading}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Masukkan nomor rekening aktif"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !amount || !accountNumber.trim()}
            className="w-full bg-brand-emerald hover:bg-brand-emerald/90 disabled:bg-zinc-800 text-black disabled:text-zinc-600 font-mono text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>AJUKAN PENCAIRAN</span>}
          </button>
        </form>
      </div>
    </div>
  );
}