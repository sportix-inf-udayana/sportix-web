import React from "react";

export default function LoginBanner() {
  return (
    <div className="w-full md:w-1/2 p-6 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-background/40 border-b md:border-b-0 md:border-r border-zinc-800">
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-brand-emerald/10 rounded-full blur-[100px]" />
      <div className="z-10">
        <div className="flex items-center gap-3 mb-8 md:mb-12">
          <div className="w-10 h-10 bg-brand-emerald rounded-lg flex items-center justify-center glow-emerald">
            <span className="font-bold text-black">SP</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground font-display">SPORTIX</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[0.95] mb-6 tracking-tight text-foreground font-display">
          DOMINATE THE <br/><span className="text-brand-emerald">COURT.</span>
        </h1>
        <p className="text-zinc-400 max-w-md leading-relaxed">
          The premium multi-tenant sports booking gateway. Sistem login kami diamankan dengan arsitektur JWT dan Role-Based Access Control.
        </p>
      </div>
    </div>
  );
}