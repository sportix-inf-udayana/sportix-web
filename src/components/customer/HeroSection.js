import React from "react";
import Image from "next/image";
import { Compass } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative h-[420px] overflow-hidden flex items-end">
      <div className="absolute inset-0">
        <Image
          src="/image/hero-arena.jpg"
          alt="Sportix Premium Arena"
          fill
          sizes="100vw"
          priority
          className="object-cover filter brightness-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full pb-10 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-neon/10 border border-brand-neon/20 rounded-full text-xs text-brand-neon mb-4">
          <Compass className="w-3 h-3 animate-spin" />
          <span className="font-mono tracking-wider uppercase">Daftar Arena Terverifikasi Otonom</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 font-display">
          Exploration <span className="text-brand-emerald">Engine</span>
        </h1>
        <p className="text-brand-slate text-sm md:text-base max-w-2xl leading-relaxed">
          Sistem terintegrasi yang menarik data langsung dari master ledger. 100% Cashless, 100% Akuntabel.
        </p>
      </div>
    </div>
  );
}