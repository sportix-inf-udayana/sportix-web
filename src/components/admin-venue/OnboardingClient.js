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
  name: z.string().min(3, "Nama venue minimal 3 karakter"),
  address: z.string().min(10, "Detail alamat harus jelas (min 10 karakter)"),
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
      const payload = { owner_id: user.id, name: data.name, address: data.address, status: 'PENDING', rating: 0 };
      
      const { error: insertErr } = await supabase.from("venues").insert(payload);
      if (insertErr) throw insertErr;
      
      router.refresh();
      router.push("/admin-venue/pending");
    } catch (err) {
      setAuthError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Pendaftaran Venue</h1>
        <p className="text-zinc-400 mt-2">Lengkapi profil fasilitas olahraga Anda untuk bergabung dengan jaringan Sportix.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
        {authError && <div className="text-red-400 text-sm p-3 bg-red-950/20 border border-red-900/50 rounded-lg">{authError}</div>}
        
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-zinc-400 uppercase block">Nama Venue</label>
          <input disabled={isSubmitting} type="text" {...register("name")} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-50" />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-zinc-400 uppercase block">Alamat Lengkap</label>
          <textarea disabled={isSubmitting} rows={3} {...register("address")} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white focus:border-blue-500 focus:outline-none resize-none transition-colors disabled:opacity-50" />
          {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
        </div>
        
        <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold font-mono text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          {isSubmitting ? "MENYIMPAN DATA..." : "KIRIM PENGAJUAN"}
        </button>
      </form>
    </div>
  );
}