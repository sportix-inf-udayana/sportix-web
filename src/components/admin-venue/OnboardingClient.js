"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Loader2, CheckCircle2, Store, ImageOff } from "lucide-react";

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const onboardingSchema = z.object({
  name: z.string().min(3, "Nama toko minimal 3 karakter"),
  address: z.string().min(10, "Alamat operasional harus jelas (min 10 karakter)"),
  image_url: z.string().url("Format URL gambar tidak valid").optional().or(z.literal('')),
});

export default function OnboardingClient() {
  const router = useRouter();
  const [authError, setAuthError] = useState(null);
  const [imageError, setImageError] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { image_url: "" }
  });

  const currentImageUrl = watch("image_url");

  const onSubmit = async (data) => {
    setAuthError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { 
        owner_id: user.id, 
        name: data.name, 
        address: data.address, 
        image_url: data.image_url && !imageError ? data.image_url : null,
        status: 'PENDING' 
      };
      
      const { error: insertErr } = await supabase.from("umkm_stores").insert(payload);
      if (insertErr) throw insertErr;
      
      router.refresh();
      router.push("/seller-umkm/pending");
    } catch (err) {
      setAuthError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Kemitraan UMKM</h1>
        <p className="text-zinc-400 mt-2">Registrasikan entitas usaha dan etalase digital Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-full aspect-square rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden relative">
              {currentImageUrl && !imageError && !errors.image_url ? (
                <Image
                  src={currentImageUrl}
                  alt="Preview"
                  fill
                  unoptimized
                  onError={() => setImageError(true)}
                  onLoadingComplete={() => setImageError(false)}
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-zinc-600">
                  {imageError ? <ImageOff className="w-10 h-10 mb-2" /> : <Store className="w-10 h-10 mb-2" />}
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Etalase Toko</span>
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-mono">Tautan logo atau etalase toko UMKM Anda.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          {authError && <div className="text-red-400 text-sm p-3 bg-red-950/20 border border-red-900/50 rounded-lg">{authError}</div>}
          
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase block">URL Foto Toko (Opsional)</label>
            <input disabled={isSubmitting} type="text" placeholder="https://example.com/store.jpg" {...register("image_url")} onChange={() => setImageError(false)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white focus:border-purple-500 focus:outline-none transition-colors disabled:opacity-50" />
            {errors.image_url && <p className="text-red-400 text-xs mt-1">{errors.image_url.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase block">Nama Toko</label>
            <input disabled={isSubmitting} type="text" {...register("name")} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white focus:border-purple-500 focus:outline-none transition-colors disabled:opacity-50" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase block">Alamat Operasional</label>
            <textarea disabled={isSubmitting} rows={3} {...register("address")} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-white focus:border-purple-500 focus:outline-none resize-none transition-colors disabled:opacity-50" />
            {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
          </div>
          
          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold font-mono text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {isSubmitting ? "MENYIMPAN DATA..." : "DAFTARKAN TOKO UMKM"}
          </button>
        </form>
      </div>
    </div>
  );
}