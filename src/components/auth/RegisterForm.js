"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Shield, User, Mail, Lock, Eye, EyeOff } from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const registerSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
  role: z.enum(["CUSTOMER", "ADMIN_VENUE", "UMKM_SELLER", "COACH"], {
    errorMap: () => ({ message: "Klasifikasi akun tidak valid" }),
  }),
});

export default function RegisterForm() {
  const router = useRouter();
  const [authError, setAuthError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "CUSTOMER",
    },
  });

  const onSubmit = async (data) => {
    setAuthError(null);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (authData?.user) {
        await supabase.auth.signOut(); // Pastikan user tidak langsung login jika butuh verifikasi email
        setSuccess(true);
        setTimeout(() => { router.push("/login"); }, 2000);
      }
    } catch (err) {
      console.error("Registration engine fault:", err);
      setAuthError(err?.message || "Terjadi kegagalan sistem yang tidak diketahui.");
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 p-6 border border-brand-emerald/20 bg-brand-emerald/10 rounded-xl shadow-xl">
        <h2 className="text-lg font-bold text-brand-emerald font-mono tracking-widest uppercase animate-pulse">
          Registrasi Berhasil
        </h2>
        <p className="text-xs font-mono text-zinc-400 leading-relaxed">
          Identitas kriptografi Anda telah diamankan. Mengalihkan Anda ke pintu masuk log in...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left font-sans">
      {authError && (
        <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-[10px] font-mono tracking-widest uppercase text-red-400">
          CRITICAL_ERROR: {authError}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">Nama Lengkap</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input 
            type="text" 
            disabled={isSubmitting}
            placeholder="Masukkan identitas lengkap" 
            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-emerald transition-colors disabled:opacity-50" 
            {...register("fullName")}
          />
        </div>
        {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">Alamat Email</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input 
            type="email" 
            disabled={isSubmitting}
            placeholder="nama@domain.com" 
            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-emerald transition-colors disabled:opacity-50" 
            {...register("email")}
          />
        </div>
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">Kata Sandi</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input 
            type={showPassword ? "text" : "password"} 
            disabled={isSubmitting}
            placeholder="••••••••" 
            className="w-full pl-10 pr-12 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-emerald transition-colors disabled:opacity-50" 
            {...register("password")}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-brand-emerald transition-colors cursor-pointer">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">Klasifikasi Akun</label>
        <div className="relative">
          <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <select 
            disabled={isSubmitting}
            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-emerald transition-colors appearance-none font-sans cursor-pointer disabled:opacity-50"
            {...register("role")}
          >
            <option value="CUSTOMER">Pelanggan (Customer)</option>
            <option value="ADMIN_VENUE">Operator Lapangan (Admin Venue)</option>
            <option value="UMKM_SELLER">Mitra Merchant (UMKM Seller)</option>
            <option value="COACH">Instruktur Olahraga (Coach)</option>
          </select>
        </div>
        {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-emerald text-black font-mono text-xs font-black tracking-wider rounded-lg hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>MENGAMANKAN DATA...</span>
          </>
        ) : (
          <span>DAFTARKAN AKUN</span>
        )}
      </button>
    </form>
  );
}