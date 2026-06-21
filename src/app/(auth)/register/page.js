/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (auth)
 * Path: src/app/(auth)/register/page.js
 * Deskripsi SRS: 
 * Portal pendaftaran akun mandiri multi-tenant. Menangani alur registrasi awal pengguna umum (Customer) 
 * maupun calon mitra usaha. Halaman ini memproses unggah dokumen legalitas operasional awal (seperti izin usaha venue, 
 * sertifikat pelatih, identitas toko) sebelum masuk ke dalam antrean kurasi oleh Super Admin.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Loader2, AlertCircle, UploadCloud } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) { return twMerge(clsx(inputs)); }

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ACCEPTED_DOC_TYPES = ["application/pdf", ...ACCEPTED_IMAGE_TYPES];

const baseSchema = z.object({
  fullName: z.string().min(3, "Nama wajib diisi minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Sandi minimal 8 karakter"),
  phone: z.string().min(10, "Nomor telepon tidak valid"),
});

const registerSchema = z.discriminatedUnion("role", [
  baseSchema.extend({ role: z.literal("CUSTOMER") }),
  baseSchema.extend({
    role: z.literal("VENUE"),
    businessName: z.string().min(3, "Nama Venue wajib diisi"),
    document: z.any()
      .refine((files) => files?.length === 1, "Surat izin usaha wajib diunggah")
      .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, "Max ukuran file 5MB.")
      .refine((files) => ACCEPTED_DOC_TYPES.includes(files?.[0]?.type), "Hanya format .pdf, .jpg, .png"),
  }),
  baseSchema.extend({
    role: z.literal("COACH"),
    specialization: z.string().min(2, "Spesialisasi wajib diisi"),
    document: z.any()
      .refine((files) => files?.length === 1, "Sertifikat wajib diunggah")
      .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, "Max ukuran file 5MB."),
  }),
  baseSchema.extend({
    role: z.literal("UMKM"),
    businessName: z.string().min(3, "Nama Toko wajib diisi"),
    document: z.any()
      .refine((files) => files?.length === 1, "KTP Pemilik wajib diunggah")
      .refine((files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), "Hanya format .jpg, .png"),
  }),
]);

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "CUSTOMER" },
  });

  const currentRole = watch("role");

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === "document" && data[key]?.length > 0) {
          formData.append(key, data[key][0]); 
        } else {
          formData.append(key, data[key]);
        }
      });

      await axios.post("/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (currentRole !== "CUSTOMER") {
        router.push("/register/pending-curation");
      } else {
        router.push("/login?registered=true");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message || "Registrasi ditolak oleh sistem.");
      } else {
        setServerError("Kesalahan sistem internal.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-8">
        <div className="mb-8 border-b border-slate-800 pb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Inisialisasi Entitas</h1>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-500 text-sm font-medium">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">Klasifikasi Akses</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["CUSTOMER", "VENUE", "COACH", "UMKM"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setValue("role", r, { shouldValidate: true })}
                  className={cn(
                    "py-2 px-3 text-xs font-bold rounded-lg border transition-all",
                    currentRole === r
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Nama Penanggung Jawab</label>
              <input {...register("fullName")} type="text" className={cn("w-full px-4 py-2 bg-slate-950 border rounded-lg text-white focus:outline-none focus:ring-2", errors.fullName ? "border-red-500" : "border-slate-800 focus:ring-indigo-500")} />
              {errors.fullName && <p className="text-red-400 text-xs">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Alamat Email</label>
              <input {...register("email")} type="email" className={cn("w-full px-4 py-2 bg-slate-950 border rounded-lg text-white focus:outline-none focus:ring-2", errors.email ? "border-red-500" : "border-slate-800 focus:ring-indigo-500")} />
              {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Kata Sandi</label>
              <input {...register("password")} type="password" className={cn("w-full px-4 py-2 bg-slate-950 border rounded-lg text-white focus:outline-none focus:ring-2", errors.password ? "border-red-500" : "border-slate-800 focus:ring-indigo-500")} />
              {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Nomor Telepon</label>
              <input {...register("phone")} type="tel" className={cn("w-full px-4 py-2 bg-slate-950 border rounded-lg text-white focus:outline-none focus:ring-2", errors.phone ? "border-red-500" : "border-slate-800 focus:ring-indigo-500")} />
              {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
            </div>
          </div>

          {currentRole !== "CUSTOMER" && (
            <div className="pt-4 border-t border-slate-800 space-y-4 bg-slate-950/50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
                <UploadCloud className="w-4 h-4" /> Syarat Kurasi Super Admin
              </h3>
              
              {(currentRole === "VENUE" || currentRole === "UMKM") && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    {currentRole === "VENUE" ? "Nama Venue" : "Nama Brand UMKM"}
                  </label>
                  <input {...register("businessName")} type="text" className={cn("w-full px-4 py-2 bg-slate-950 border rounded-lg text-white focus:outline-none focus:ring-2", errors.businessName ? "border-red-500" : "border-slate-800 focus:ring-indigo-500")} />
                  {errors.businessName && <p className="text-red-400 text-xs">{errors.businessName.message}</p>}
                </div>
              )}

              {currentRole === "COACH" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Spesialisasi (Misal: Futsal)</label>
                  <input {...register("specialization")} type="text" className={cn("w-full px-4 py-2 bg-slate-950 border rounded-lg text-white focus:outline-none focus:ring-2", errors.specialization ? "border-red-500" : "border-slate-800 focus:ring-indigo-500")} />
                  {errors.specialization && <p className="text-red-400 text-xs">{errors.specialization.message}</p>}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Dokumen Pendukung (Max 5MB)
                </label>
                <input 
                  {...register("document")} 
                  type="file" 
                  accept={currentRole === "UMKM" ? ".jpg,.jpeg,.png" : ".pdf,.jpg,.jpeg,.png"}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700" 
                />
                {errors.document && <p className="text-red-400 text-xs">{errors.document?.message?.toString()}</p>}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
          >
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Memproses Injeksi Data...</span></> : "Eksekusi Registrasi"}
          </button>
        </form>
      </div>
    </main>
  );
}
