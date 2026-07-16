// src/components/coach/WithdrawalClientWrapper.js
"use client";
import React, { useState } from "react";
import WithdrawalModal from "./WithdrawalModal";
import { Wallet, ArrowUpRight } from "lucide-react";

export default function WithdrawalClientWrapper({ balance }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const availableBalance = balance?.amount || 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl max-w-md relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-emerald" />
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase font-bold mb-1">Saldo Tersedia (IDR)</p>
          <h3 className="text-3xl font-black text-white font-mono tracking-tight">
            Rp {Number(availableBalance).toLocaleString("id-ID")}
          </h3>
        </div>
      </div>

      <button 
        onClick={() => setIsModalOpen(true)}
        disabled={availableBalance < 50000}
        className="w-full bg-brand-emerald hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed cursor-pointer uppercase tracking-widest font-mono flex items-center justify-center gap-2"
      >
        <span>TARIK DANA</span>
        <ArrowUpRight className="w-4 h-4" />
      </button>
      
      {availableBalance < 50000 && (
        <p className="text-center mt-4 text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
          *Minimum penarikan Rp 50.000
        </p>
      )}
      
      <WithdrawalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        availableBalance={availableBalance} 
      />
    </div>
  );
}