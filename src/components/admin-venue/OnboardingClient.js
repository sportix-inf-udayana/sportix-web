// src/components/admin-venue/OnboardingClient.js
"use client";
import React, { useState, useTransition } from "react";
import { submitVenueOnboardingAction } from "@/app/(dashboard)/admin-venue/_actions";
import { Loader2, CheckCircle2, AlertCircle, Building2, MapPin, Phone, Info } from "lucide-react";

export default function OnboardingClient() {
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await submitVenueOnboardingAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 font-sans">
      <div className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black text-white font-display uppercase tracking-tight">Pendaftaran Venue</h1>
        <p className="text-zinc-500 mt-1 font-mono text-xs">Daftarkan fasilitas olahraga Anda ke ekosistem Sportix.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-lg">
        {error && (
          <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg flex items-start gap-2 text-red-400 font-mono text-[10px] uppercase tracking-widest">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Nama Venue</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Building2 className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                disabled={isPending} 
                placeholder="Sportix Arena"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-50 font-mono text-sm" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="phone" className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Telepon Operasional</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Phone className="w-4 h-4" />
              </div>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                required 
                disabled={isPending} 
                placeholder="08123456789"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-50 font-mono text-sm" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Alamat Lengkap</label>
          <div className="relative">
            <div className="absolute top-3.5 left-3.5 pointer-events-none text-zinc-500">
              <MapPin className="w-4 h-4" />
            </div>
            <textarea 
              id="address" 
              name="address" 
              required 
              rows="3" 
              disabled={isPending} 
              placeholder="Jl. Olahraga No. 1..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:outline-none resize-none transition-colors disabled:opacity-50 font-mono text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Deskripsi & Fasilitas</label>
          <div className="relative">
            <div className="absolute top-3.5 left-3.5 pointer-events-none text-zinc-500">
              <Info className="w-4 h-4" />
            </div>
            <textarea 
              id="description" 
              name="description" 
              rows="4" 
              disabled={isPending} 
              placeholder="Fasilitas lapangan indoor standar FIFA..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:outline-none resize-none transition-colors disabled:opacity-50 font-mono text-sm"
            />
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isPending} 
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black font-mono text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.2)] tracking-widest uppercase"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {isPending ? "MENGIRIM FORMULIR..." : "AJUKAN KEMITRAAN VENUE"}
          </button>
        </div>
      </form>
    </div>
  );
}