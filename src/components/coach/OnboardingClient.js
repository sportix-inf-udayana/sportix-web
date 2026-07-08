"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, CheckCircle2 } from "lucide-react";

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function OnboardingClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        user_id: user.id, specialization: e.target.specialization.value,
        price_per_hour: parseInt(e.target.price.value), experience_years: parseInt(e.target.experience.value),
        bio: e.target.bio.value, status: 'PENDING'
      };
      const { error: insertErr } = await supabase.from("coaches").insert(payload);
      if (insertErr) throw insertErr;
      router.refresh();
      router.push("/coach/pending");
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Kualifikasi Pelatih</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
        {error && <div className="text-red-400 text-sm p-3 bg-red-950/20 border border-red-900/50 rounded-lg">{error}</div>}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-zinc-400 uppercase">Spesialisasi</label>
          <input type="text" name="specialization" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white focus:border-brand-emerald focus:outline-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase">Tarif/Jam (IDR)</label>
            <input type="number" name="price" required min="10000" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white focus:border-brand-emerald focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase">Tahun Pengalaman</label>
            <input type="number" name="experience" required min="0" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white focus:border-brand-emerald focus:outline-none" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-zinc-400 uppercase">Deskripsi & Prestasi</label>
          <textarea name="bio" required rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white focus:border-brand-emerald focus:outline-none resize-none" />
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-emerald text-background rounded-xl font-bold font-mono text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          {isSubmitting ? "MENYIMPAN DATA..." : "KIRIM PENGAJUAN"}
        </button>
      </form>
    </div>
  );
}