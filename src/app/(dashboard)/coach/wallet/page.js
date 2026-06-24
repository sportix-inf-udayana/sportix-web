/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (dashboard)
 * Path: src/app/(dashboard)/coach/wallet/page.js
 * Deskripsi SRS: 
 * Akuntansi finansial personal pelatih. Digunakan untuk menentukan tarif jasa bimbingan per jam, memantau riwayat saldo 
 * masuk (credit) hasil sesi mengajar yang selesai, serta mengontrol portal pengajuan penarikan dana (withdrawal request) 
 * ke rekening bank pribadi.
 */

"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  DollarSign, 
  CreditCard, 
  Send, 
  CheckCircle2, 
  TrendingUp,
  Briefcase
} from "lucide-react";

export default function CoachWalletPage() {
  const [balance, setBalance] = useState(4500000);
  const [bankName, setBankName] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleWithdraw = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const amount = parseFloat(withdrawAmount);
    if (!accountNumber) {
      setError("Nomor rekening bank tujuan wajib diisi!");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setError("Harap masukkan jumlah pencairan yang valid!");
      return;
    }
    if (amount > balance) {
      setError("Saldo Anda tidak mencukupi untuk nominal pencairan ini!");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setBalance(balance - amount);
      setSuccess(`Pencairan dana Rp ${amount.toLocaleString("id-ID")} berhasil diproses! Sedang dikirim ke rekening ${bankName} - ${accountNumber}.`);
      setWithdrawAmount("");
      setAccountNumber("");
    }, 1500);
  };

  const navigateBack = () => {
    window.location.hash = "/coach/schedule";
    if (window.__sportixNavigate) {
      window.__sportixNavigate("/coach/schedule");
    }
  };

  return (
    <div className="bg-[#09090b] text-[#e5e2e1] min-h-screen pb-16 font-sans select-none">
      
      {/* Header Container */}
      <div className="border-b border-zinc-800 bg-[#0e0e0e] py-6 px-6">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button 
            onClick={navigateBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all text-xs font-mono uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>KEMBALI KE MATRIX</span>
          </button>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">PORTAL WALLET</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 mt-8">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">Trainer Balance Withdrawal</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Cairkan hasil pendapatan private training Anda secara aman dan instan langsung ke rekening bank terdaftar Anda.
          </p>
        </div>

        {/* Balance Status Card */}
        <div className="bg-gradient-to-br from-zinc-900 to-[#131313] border border-zinc-800 rounded-xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#4edea3]" />
          <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider mb-1">
            CURRENT TRAINER NET BALANCE
          </span>
          <h3 className="text-3xl font-mono font-black text-white">
            Rp {balance.toLocaleString("id-ID")}
          </h3>
          <p className="text-[10px] text-[#4edea3] font-mono mt-3 uppercase flex items-center gap-1.5 leading-none">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Cashless Reconciliation Verified
          </p>
        </div>

        {/* Withdrawal Form Card */}
        <div className="bg-[#131313] border border-zinc-800 rounded-xl p-6 shadow-2xl relative">
          
          {success && (
            <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-start gap-2.5 leading-normal">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <h5 className="font-bold uppercase font-mono tracking-wider mb-1">Pencairan Sukses</h5>
                <p>{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-950/40 border border-red-500/30 rounded text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-5">
            {/* BANK SELECTION */}
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-2">
                Pilih Bank Tujuan
              </label>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {["BCA", "Mandiri", "BNI", "GoPay"].map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setBankName(bank)}
                    className={`py-2 rounded-lg font-bold border transition-all ${
                      bankName === bank 
                        ? "bg-zinc-800 border-[#4edea3] text-white" 
                        : "bg-[#0e0e0e] border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </div>

            {/* ACCOUNT NUMBER */}
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1.5">
                Nomor Rekening / Akun E-Wallet
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-600">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g., 8832-198-291"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-[#0e0e0e] border border-zinc-800 focus:border-[#4edea3] rounded-lg py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-700 outline-none transition-all uppercase font-mono"
                />
              </div>
            </div>

            {/* WITHDRAW AMOUNT */}
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1.5">
                Nominal Penarikan (IDR)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  placeholder="e.g., 2000000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-[#0e0e0e] border border-zinc-800 focus:border-[#4edea3] rounded-lg py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-700 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4edea3] hover:bg-[#3cd094] text-[#003824] font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 uppercase tracking-wider font-mono transition-all duration-300 hover:shadow-[0_0_15px_rgba(78,222,163,0.2)] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#003824] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit Withdrawal Request</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Secure disclosure */}
        <div className="text-center mt-6">
          <p className="text-[9px] font-mono text-zinc-600 tracking-wider uppercase">
            🛡️ RECONCILIATED VIA PAYMENT RECONCILIATION AGENT (PRA) ENGINE
          </p>
        </div>

      </div>
    </div>
  );
}