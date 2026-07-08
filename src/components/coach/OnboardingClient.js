"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const onboardingSchema = z.object({
  specialization: z.string().min(3, "Spesialisasi minimal 3 karakter"),
  price: z.coerce.number().min(10000, "Tarif minimal Rp 10.000"),
  experience: z.coerce.number().min(0, "Pengalaman tidak valid"),
  bio: z.string().min(15, "Deskripsi minimal 15 karakter"),
});

export default function OnboardingClient() {
  const router = useRouter();
  const [authError, setAuthError] = useState(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(onboardingSchema)
  });

  const onSubmit = async (data) => {
    setAuthError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        user_id: user.id, specialization: data.specialization,
        price_per_hour: data.price, experience_years: data.experience,
        bio: data.bio, status: 'PENDING'
      };
      
      const { error: insertErr } = await supabase.from("coaches").insert(payload);
      if (insertErr) throw insertErr;
      
      router.refresh();
      router.push("/coach/pending");
    } catch (err) {
      setAuthError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Kualifikasi Pelatih</h1>
        <p className="text-zinc-400 mt-2">Daftarkan spesialisasi dan portofolio kepelatihan Anda.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
        {authError && <div className="text-red-400 text-sm p-3 bg-red-950/20 border border-red-900/50 rounded-lg">{authError}</div>}
        
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-zinc-400 uppercase block">Spesialisasi</label>
          <input disabled={isSubmitting} type="text" {...register("specialization")} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white focus:border-brand-emerald focus:outline-none transition-colors disabled:opacity-50" />
          {errors.specialization && <p className="text-red-400 text-xs mt-1">{errors.specialization.message}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase block">Tarif/Jam (IDR)</label>
            <input disabled={isSubmitting} type="number" {...register("price")} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white focus:border-brand-emerald focus:outline-none transition-colors disabled:opacity-50" />
            {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase block">Tahun Pengalaman</label>
            <input disabled={isSubmitting} type="number" {...register("experience")} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white focus:border-brand-emerald focus:outline-none transition-colors disabled:opacity-50" />
            {errors.experience && <p className="text-red-400 text-xs mt-1">{errors.experience.message}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-zinc-400 uppercase block">Deskripsi & Prestasi</label>
          <textarea disabled={isSubmitting} rows={4} {...register("bio")} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white focus:border-brand-emerald focus:outline-none resize-none transition-colors disabled:opacity-50" />
          {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>}
        </div>
        
        <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-emerald hover:bg-emerald-400 text-black rounded-xl font-bold font-mono text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          {isSubmitting ? "MENYIMPAN DATA..." : "KIRIM PENGAJUAN"}
        </button>
      </form>
    </div>
  );
}