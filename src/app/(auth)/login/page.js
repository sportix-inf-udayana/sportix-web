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
import { Loader2, AlertCircle, Activity } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

// Peta rute fisik absolut berdasarkan aturan hak akses multi-tenant SRS Bab 5.1
const ROLE_ROUTES = {
  CUSTOMER: "/",
  ADMIN_VENUE: "/admin-venue/reports",
  COACH: "/coach/schedule",
  UMKM_SELLER: "/seller-umkm/products",
  SUPER_ADMIN: "/super-admin/verifications",
};

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
      const response = await axios.post("/api/auth/login", data);
      const userRole = response.data?.user?.role;

      const targetRoute = ROLE_ROUTES[userRole];
      if (targetRoute) {
        router.push(targetRoute);
        router.refresh();
      } else {
        setServerError("Hak akses peran (role) tidak dikenali oleh sistem.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message || "Kredensial ditolak server.");
      } else {
        setServerError("Terjadi kesalahan jaringan yang tidak terduga.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans selection:bg-cyan-500/30">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-xl shadow-2xl p-8 relative overflow-hidden">
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-cyan-400 font-bold tracking-wider text-xs uppercase bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            <Activity className="w-3. h-3" /> Sportix Gate
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Otorisasi Akses</h1>
          <p className="text-sm text-slate-400">Masuk ke dalam ekosistem otonom terpadu.</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm font-medium leading-relaxed">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Email Akses</label>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              className={`w-full px-4 py-2.5 bg-slate-950 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.email ? "border-red-500 focus:ring-red-500/20" : "border-slate-800 focus:ring-cyan-500/40 focus:border-transparent"
              }`}
              placeholder="nama@institusi.com"
            />
            {errors.email && <p className="text-red-400 text-xs font-medium">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Kata Sandi</label>
            <input
              {...register("password")}
              type="password"
              autoComplete="current-password"
              className={`w-full px-4 py-2.5 bg-slate-950 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.password ? "border-red-500 focus:ring-red-500/20" : "border-slate-800 focus:ring-cyan-500/40 focus:border-transparent"
              }`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-400 text-xs font-medium">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(8,145,178,0.2)]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Pola Akses...</span>
              </>
            ) : (
              "Otorisasi Masuk"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/60 text-center">
          <p className="text-xs text-slate-400">
            Belum terdaftar di ekosistem?{" "}
            <Link href="/register" className="text-cyan-400 hover:underline font-medium">
              Buat Akun Baru
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}