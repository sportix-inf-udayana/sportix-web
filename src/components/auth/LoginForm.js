"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ROLE_REDIRECTS = {
  SUPER_ADMIN: "/super-admin/verifications",
  ADMIN_VENUE: "/admin-venue/slots",
  COACH: "/coach/schedule",
  UMKM_SELLER: "/seller-umkm/products",
  CUSTOMER: "/",
};

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setAuthError(null);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      if (authData?.user) {
        const role = authData.user.user_metadata?.role || "CUSTOMER";
        const callbackUrl = searchParams.get("callback");
        const destination = callbackUrl 
          ? decodeURIComponent(callbackUrl) 
          : (ROLE_REDIRECTS[role] || "/");

        router.refresh();
        router.push(destination);
      }
    } catch (err) {
      console.error("Authentication Failure:", err);
      setAuthError(err.message || "Email atau password yang Anda masukkan salah.");
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center lg:text-left">
        <Link href="/" className="font-display font-black text-2xl tracking-tight text-white inline-block mb-2">
          SPORTIX<span className="text-brand-emerald">.</span>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-4 uppercase">Otorisasi Akun</h1>
        <p className="text-zinc-500 text-sm mt-2">
          Masukkan kredensial Anda untuk mengakses kembali ekosistem fasilitas olahraga otonom.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left font-sans w-full">
        {authError && (
          <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-[10px] font-mono tracking-widest uppercase text-red-400">
            CRITICAL_ERROR: {authError}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase block">Alamat Email</label>
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
          <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase block">Kata Sandi</label>
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

        <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-emerald text-black font-mono text-xs font-black tracking-wider rounded-lg hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>MEMVALIDASI SESI...</span>
            </>
          ) : (
            <span>MASUK KE SISTEM</span>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Belum memiliki Akun?{" "}
        <Link href="/register" className="text-brand-emerald font-bold hover:text-emerald-400 transition-colors">
          Daftar di sini.
        </Link>
      </p>
    </div>
  );
}