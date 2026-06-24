/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (auth)
 * Path: src/app/(auth)/register/page.js
 * Deskripsi SRS: 
 * Portal pendaftaran akun mandiri multi-tenant terintegrasi dengan Supabase Auth.
 * Menangani alur registrasi awal pengguna umum (Customer) maupun calon mitra usaha. 
 * Data entitas tambahan disimpan pada metadata pengguna (user_metadata) untuk diproses 
 * oleh trigger database atau Super Admin di kemudian hari.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

// Skema registrasi dinamis terintegrasi konstrain data fisik SRS Bab 4.1
const registerSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  full_name: z.string().min(1, "Nama lengkap sesuai identitas wajib diisi"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  role: z.enum(["CUSTOMER", "ADMIN_VENUE", "COACH", "UMKM_SELLER"]),
  
  // Field entitas opsional yang divalidasi ketat secara kondisional
  venue_name: z.string().optional(),
  venue_address: z.string().optional(),
  specialization: z.string().optional(),
  bio: z.string().optional(),
  price_per_hour: z.coerce.number().min(0, "Tarif tidak boleh negatif").optional(),
  store_name: z.string().optional(),
  store_description: z.string().optional(),
  store_address: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === "ADMIN_VENUE") {
    if (!data.venue_name || data.venue_name.trim() === "") {
      ctx.addIssue({ path: ["venue_name"], message: "Nama lokasi/venue wajib diisi", code: z.ZodIssueCode.custom });
    }
    if (!data.venue_address || data.venue_address.trim() === "") {
      ctx.addIssue({ path: ["venue_address"], message: "Alamat fisik venue lengkap wajib diisi", code: z.ZodIssueCode.custom });
    }
  }
  if (data.role === "COACH") {
    if (!data.specialization || data.specialization.trim() === "") {
      ctx.addIssue({ path: ["specialization"], message: "Bidang spesialisasi olahraga wajib diisi", code: z.ZodIssueCode.custom });
    }
    if (!data.price_per_hour || data.price_per_hour <= 0) {
      ctx.addIssue({ path: ["price_per_hour"], message: "Tarif mengajar per jam wajib diisi", code: z.ZodIssueCode.custom });
    }
  }
  if (data.role === "UMKM_SELLER") {
    if (!data.store_name || data.store_name.trim() === "") {
      ctx.addIssue({ path: ["store_name"], message: "Nama toko dagang konsinyasi wajib diisi", code: z.ZodIssueCode.custom });
    }
    if (!data.store_address || data.store_address.trim() === "") {
      ctx.addIssue({ path: ["store_address"], message: "Alamat operasional toko wajib diisi", code: z.ZodIssueCode.custom });
    }
  }
});

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState(null);
  const [successState, setSuccessState] = useState(false);

  // Inisialisasi Supabase Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_ANON_KEY
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      email: "", full_name: "", password: "", role: "CUSTOMER",
      venue_name: "", venue_address: "", specialization: "", bio: "", price_per_hour: 0,
      store_name: "", store_description: "", store_address: ""
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      // Isolasi data spesifik untuk dimasukkan ke metadata Supabase
      const metadata = {
        full_name: data.full_name,
        role: data.role,
        ...(data.role === "ADMIN_VENUE" && { venue_name: data.venue_name, venue_address: data.venue_address }),
        ...(data.role === "COACH" && { specialization: data.specialization, bio: data.bio, price_per_hour: data.price_per_hour }),
        ...(data.role === "UMKM_SELLER" && { store_name: data.store_name, store_address: data.store_address, store_description: data.store_description }),
      };

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        setServerError(error.message);
        return;
      }

      setSuccessState(true);
      
      // Memberi jeda visual agar user memahami notifikasi alur approval SRS Bab 2.5
      setTimeout(() => {
        router.push("/login");
      }, 4500);
    } catch (error) {
      setServerError("Terjadi kesalahan komputasi jaringan.");
    }
  };

  if (successState) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Registrasi Berhasil Diinisiasi</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {selectedRole === "CUSTOMER" 
              ? "Akun Anda telah aktif. Mengalihkan secara otomatis ke pintu gerbang masuk..."
              : "Berkas legalitas operasional akun mitra Anda berhasil direkam. Menunggu proses peninjauan manual (APPROVED) oleh Super Admin sebelum modul bisnis aktif."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans selection:bg-cyan-500/30 py-12">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800/80 rounded-xl shadow-2xl p-8 relative">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Pendaftaran Ekosistem</h1>
          <p className="text-sm text-slate-400 mt-2">Daftarkan entitas Anda secara otonom ke jaringan Sportix.</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm font-medium leading-relaxed">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Nama Lengkap</label>
              <input
                {...register("full_name")}
                type="text"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50"
                placeholder="Putu Maichail"
              />
              {errors.full_name && <p className="text-red-400 text-xs">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Daftar Sebagai</label>
              <select
                {...register("role")}
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 appearance-none disabled:opacity-50"
              >
                <option value="CUSTOMER">Penyewa</option>
                <option value="ADMIN_VENUE">Admin Tempat Usaha</option>
                <option value="COACH">Pelatih Privat</option>
                <option value="UMKM_SELLER">Penjual Produk</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Email Akses</label>
              <input
                {...register("email")}
                type="email"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50"
                placeholder="nama@domain.com"
              />
              {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Kata Sandi Baru</label>
              <input
                {...register("password")}
                type="password"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
            </div>
          </div>

          {selectedRole === "ADMIN_VENUE" && (
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Konfigurasi Struktur Tempat Usaha (Venues)</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nama Lapangan / Tempat Usaha</label>
                  <input
                    {...register("venue_name")}
                    type="text"
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white text-sm focus:outline-none border-l-2 border-l-cyan-500 disabled:opacity-50"
                    placeholder="Contoh: Pecatu Futsal Arena"
                  />
                  {errors.venue_name && <p className="text-red-400 text-xs mt-1">{errors.venue_name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Alamat Fisik Lengkap Lokasi</label>
                  <textarea
                    {...register("venue_address")}
                    rows={2}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white text-sm focus:outline-none border-l-2 border-l-cyan-500 resize-none disabled:opacity-50"
                    placeholder="Jalan Raya Kuta Selatan, Badung, Bali..."
                  />
                  {errors.venue_address && <p className="text-red-400 text-xs mt-1">{errors.venue_address.message}</p>}
                </div>
              </div>
            </div>
          )}

          {selectedRole === "COACH" && (
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Spesifikasi Lisensi & Tarif Pengajar (Coaches)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Bidang Spesialisasi Olahraga</label>
                  <input
                    {...register("specialization")}
                    type="text"
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white text-sm focus:outline-none border-l-2 border-l-cyan-500 disabled:opacity-50"
                    placeholder="Contoh: Bulutangkis Tunggal / Tenis"
                  />
                  {errors.specialization && <p className="text-red-400 text-xs mt-1">{errors.specialization.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tarif Mengajar Per Jam (IDR)</label>
                  <input
                    {...register("price_per_hour")}
                    type="number"
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white text-sm focus:outline-none border-l-2 border-l-cyan-500 disabled:opacity-50"
                    placeholder="150000"
                  />
                  {errors.price_per_hour && <p className="text-red-400 text-xs mt-1">{errors.price_per_hour.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Riwayat Singkat Komparasi Pengalaman (Bio)</label>
                <textarea
                  {...register("bio")}
                  rows={2}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white text-sm focus:outline-none resize-none disabled:opacity-50"
                  placeholder="Deskripsikan sertifikasi kepelatihan lokal Anda..."
                />
              </div>
            </div>
          )}

          {selectedRole === "UMKM_SELLER" && (
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Identitas Kemitraan Toko Konsinyasi (UMKM Stores)</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nama Toko Dagang Komersial</label>
                  <input
                    {...register("store_name")}
                    type="text"
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white text-sm focus:outline-none border-l-2 border-l-cyan-500 disabled:opacity-50"
                    placeholder="Contoh: Bali Sport Pro-Shop"
                  />
                  {errors.store_name && <p className="text-red-400 text-xs mt-1">{errors.store_name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Alamat Gudang / Pengiriman Resi Kurir</label>
                  <textarea
                    {...register("store_address")}
                    rows={2}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white text-sm focus:outline-none border-l-2 border-l-cyan-500 resize-none disabled:opacity-50"
                    placeholder="Alamat asal pengiriman kurir lokal Bali..."
                  />
                  {errors.store_address && <p className="text-red-400 text-xs mt-1">{errors.store_address.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Deskripsi Produk Jualan</label>
                  <textarea
                    {...register("store_description")}
                    rows={2}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white text-sm focus:outline-none resize-none disabled:opacity-50"
                    placeholder="Katalog tipe barang buatan lokal..."
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mendaftarkan Struktur Data...</span>
              </>
            ) : (
              "Ajukan Registrasi Akun"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/60 text-center">
          <p className="text-xs text-slate-400">
            Sudah memiliki otorisasi?{" "}
            <Link href="/login" className="text-cyan-400 hover:underline font-medium">
              Masuk Disini
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}