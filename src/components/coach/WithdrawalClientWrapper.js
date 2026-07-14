"use client";

import React, { useState } from "react";
import WithdrawalModal from "./WithdrawalModal";
import { Wallet } from "lucide-react";

export default function WithdrawalClientWrapper({ balance }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const availableBalance = balance?.amount || 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md max-w-md">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">Saldo Tersedia</p>
          <h3 className="text-2xl font-black text-white font-mono mt-1">
            Rp {Number(availableBalance).toLocaleString("id-ID")}
          </h3>
        </div>
      </div>

      <button 
        onClick={() => setIsModalOpen(true)}
        disabled={availableBalance <= 0}
        className="w-full bg-brand-emerald hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed cursor-pointer uppercase tracking-widest font-mono"
      >
        Tarik Dana
      </button>
      
      <WithdrawalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        availableBalance={availableBalance} 
      />
    </div>
  );
}