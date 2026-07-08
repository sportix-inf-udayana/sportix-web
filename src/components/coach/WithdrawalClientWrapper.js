"use client";

import React, { useState } from "react";
import WithdrawalModal from "./WithdrawalModal";

export default function WithdrawalClientWrapper({ maxBalance }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        disabled={maxBalance <= 0}
        className="bg-brand-emerald hover:bg-emerald-400 text-black font-black py-4 px-8 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer uppercase tracking-widest font-mono"
      >
        Tarik Dana
      </button>
      
      <WithdrawalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        availableBalance={maxBalance} 
      />
    </>
  );
}