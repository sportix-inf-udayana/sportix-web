// src/components/customer/HeroSection.js
import React from "react";
import Image from "next/image";
import { MapPin, ShieldCheck, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <Image 
          src="/image/hero-arena.jpg" 
          alt="Sportix Premium Arena" 
          fill 
          priority 
          className="object-cover object-center opacity-40 grayscale" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center flex flex-col items-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald mb-6 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase">100% SECURE CASHLESS PROTOCOL</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white font-display uppercase tracking-tighter mb-6 leading-tight max-w-4xl">
          Dominasi <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-emerald-300">Arena Anda</span>
        </h1>
        
        <p className="text-zinc-400 text-xs md:text-sm max-w-2xl mx-auto mb-10 font-mono leading-relaxed uppercase tracking-wider">
          Ekosistem reservasi fasilitas olahraga terdesentralisasi. Bebas manipulasi, bebas <span className="text-white font-bold">double-booking</span>. Penguncian jadwal otonom via SLA.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-md">
          <button className="w-full sm:w-auto px-8 py-4 bg-brand-emerald hover:bg-emerald-400 text-black font-black text-xs font-mono tracking-widest uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 cursor-pointer">
            <Zap className="w-4 h-4 fill-black" />
            <span>EKSPLORASI SEKARANG</span>
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-xs font-mono tracking-widest uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
            <MapPin className="w-4 h-4 text-zinc-500" />
            <span>REGIONAL BALI</span>
          </button>
        </div>
      </div>
    </div>
  );
}