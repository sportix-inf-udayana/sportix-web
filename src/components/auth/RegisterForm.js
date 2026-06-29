"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, Shield, User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role, 
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data?.user) {
        // FIX: Hancurkan session instan untuk mematikan auto-login
        await supabase.auth.signOut();
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      console.error("Registration engine fault:", err);
      const errorMessage = err?.message || err?.error_description || err?.msg || "Terjadi kegagalan sistem yang tidak diketahui.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 p-6 border border-brand-emerald/20 bg-brand-emerald/5 rounded-xl">
        <h2 className="text-xl font-bold text-brand-emerald font-mono tracking-wider animate-pulse">
          REGISTRASI BERHASIL
        </h2>
        <p className="text-sm text-brand-slate leading-relaxed">
          Identitas kriptografi Anda telah diamankan. Mengalihkan Anda ke pintu masuk log in...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-5 text-left">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-mono text-red-400">
          CRITICAL_ERROR: {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-mono font-bold tracking-wider text-brand-slate uppercase">Nama Lengkap</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="Masukkan identitas lengkap" className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-emerald transition-colors" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-mono font-bold tracking-wider text-brand-slate uppercase">Alamat Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="nama@domain.com" className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-emerald transition-colors" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-mono font-bold tracking-wider text-brand-slate uppercase">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type={showPassword ? "text" : "password"} 
            name="password" 
            required 
            minLength={6} 
            value={formData.password} 
            onChange={handleChange} 
            placeholder="••••••••" 
            className="w-full pl-10 pr-12 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-emerald transition-colors" 
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-brand-emerald transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-mono font-bold tracking-wider text-brand-slate uppercase">Klasifikasi Akun</label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <select name="role" value={formData.role} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-emerald transition-colors appearance-none font-sans">
            <option value="CUSTOMER">Pelanggan (Customer)</option>
            <option value="ADMIN_VENUE">Operator Lapangan (Admin Venue)</option>
            <option value="UMKM_SELLER">Mitra Merchant (UMKM Seller)</option>
            <option value="COACH">Instruktur Olahraga (Coach)</option>
          </select>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full py-3 bg-brand-emerald text-background font-mono text-sm font-bold rounded-lg hover:bg-brand-emerald/90 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
        {loading ? (
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