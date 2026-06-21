/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (auth)
 * Path: src/app/(auth)/login/page.js
 * Deskripsi SRS: 
 * Antarmuka gerbang masuk tunggal bagi seluruh aktor ekosistem Sportix (Customer, Admin Venue, Pelatih, Seller UMKM). 
 * Form divalidasi secara ketat dan terhubung langsung dengan sistem token JWT otonom di lapisan middleware global 
 * untuk mencegah bypass akses ilegal serta memastikan pemisahan hak akses (RBAC).
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Loader2, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      await axios.post("/api/auth/login", data);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message || "Kredensial ditolak server.");
      } else {
        setServerError("Terjadi kesalahan jaringan yang tidak terduga.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Sportix Gateway</h1>
          <p className="text-sm text-slate-400 mt-2">Sistem akses otonom tervalidasi.</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-500 text-sm font-medium leading-relaxed">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Email Akses</label>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              className={cn(
                "w-full px-4 py-2.5 bg-slate-950 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all",
                errors.email 
                  ? "border-red-500 focus:ring-red-500/50" 
                  : "border-slate-800 focus:ring-indigo-500 focus:border-transparent"
              )}
              placeholder="nama@institusi.com"
            />
            {errors.email && <p className="text-red-400 text-xs font-medium">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-300">Kata Sandi</label>
            </div>
            <input
              {...register("password")}
              type="password"
              autoComplete="current-password"
              className={cn(
                "w-full px-4 py-2.5 bg-slate-950 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all",
                errors.password 
                  ? "border-red-500 focus:ring-red-500/50" 
                  : "border-slate-800 focus:ring-indigo-500 focus:border-transparent"
              )}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-400 text-xs font-medium">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              "Otorisasi Akses"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}