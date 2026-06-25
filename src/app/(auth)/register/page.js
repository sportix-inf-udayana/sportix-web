"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ShieldAlert, User, Mail, Lock, ArrowRight, Sparkles, Info } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("CUSTOMER");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreePenalty, setAgreePenalty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const roles = [
    { id: "CUSTOMER", label: "Athlete", desc: "Book courts & training sessions" },
    { id: "ADMIN_VENUE", label: "Venue Admin", desc: "Host venues & manage court slots" },
    { id: "COACH", label: "Coach", desc: "Offer elite training & manage sessions" },
    { id: "UMKM_SELLER", label: "Merchant", desc: "Sell Balinese & athletic gear" },
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName || !email || !password) {
      setError("Semua kolom isian wajib dilengkapi.");
      return;
    }
    if (!agreePenalty) {
      setError("Anda wajib menyetujui Kebijakan Hangus Mutlak 15 Menit.");
      return;
    }

    setLoading(true);

    try {
      // Eksekusi Pendaftaran Kriptografis ke Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role // INJEKSI MUTLAK: Metadata ini dibaca oleh Middleware untuk RBAC
          }
        }
      });

      if (signUpError) throw signUpError;

      setSuccess("Registrasi kriptografis berhasil! Silakan periksa email Anda (jika konfirmasi diaktifkan) atau langsung masuk.");
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err) {
      setError(err.message || "Gagal melakukan registrasi sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row relative overflow-hidden select-none font-sans bg-background">
      {/* LEFT SIDE - Hero content (Dipersingkat untuk fokus pada logika) */}
      <div className="w-full md:w-1/2 p-6 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-background/40 border-b md:border-b-0 md:border-r border-zinc-800">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-brand-emerald/10 rounded-full blur-[100px]" />
        <div className="z-10">
          <div className="flex items-center gap-3 mb-8 md:mb-12">
            <div className="w-10 h-10 bg-brand-emerald rounded-lg flex items-center justify-center glow-emerald">
              <span className="font-bold text-black">SP</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground font-display">SPORTIX</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[0.95] mb-6 tracking-tight text-foreground font-display">
            JOIN THE <br/><span className="text-brand-emerald">LINEUP.</span>
          </h1>
          <p className="text-zinc-400 max-w-md leading-relaxed">
            Create your high-performance account. Peran JWT (JSON Web Token) Anda akan diukir ke dalam basis data otonom kami.
          </p>
        </div>
        <div className="z-10 space-y-4 mt-8 md:mt-0">
          <div className="bg-brand-amber/10 border border-brand-amber/30 p-4 rounded-xl flex gap-4 items-start max-w-md">
            <Info className="w-5 h-5 text-brand-amber shrink-0" />
            <div>
              <p className="text-brand-amber text-xs font-bold uppercase tracking-wider mb-1 font-mono">Kebijakan Akun Tunggal</p>
              <p className="text-zinc-300 text-xs">Pilih peran utama Anda dengan bijak. Middleware kami menggunakan Role-Based Access Control ketat.</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Registration Form */}
      <div className="w-full md:w-1/2 min-h-full flex items-center justify-center p-6 md:p-12 lg:p-16 bg-black/40">
        <div className="glass-panel w-full max-w-md p-8 md:p-10 rounded-3xl glow-emerald relative">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-foreground font-display">Daftar Akun</h2>
            <p className="text-zinc-400 text-xs mt-1">Otorisasi basis data terenkripsi.</p>
          </div>

          {success && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded text-xs text-brand-emerald flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" /> {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded text-xs text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-micro font-bold text-zinc-500 uppercase tracking-widest font-mono">Pilih Peran Utama</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      role === r.id ? "bg-brand-emerald/10 border-brand-emerald text-brand-neon" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <div className="text-xs font-bold">{r.label}</div>
                    <div className="text-micro text-zinc-500 mt-1 truncate">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-micro font-bold text-zinc-500 uppercase tracking-widest font-mono">Nama Lengkap</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 focus:border-brand-emerald rounded-xl py-3 pl-10 pr-4 text-xs text-foreground outline-none transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-micro font-bold text-zinc-500 uppercase tracking-widest font-mono">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 focus:border-brand-emerald rounded-xl py-3 pl-10 pr-4 text-xs text-foreground outline-none transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-micro font-bold text-zinc-500 uppercase tracking-widest font-mono">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 focus:border-brand-emerald rounded-xl py-3 pl-10 pr-4 text-xs text-foreground outline-none transition-colors" />
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input type="checkbox" checked={agreePenalty} onChange={(e) => setAgreePenalty(e.target.checked)} className="mt-1 accent-brand-emerald w-4 h-4 rounded bg-zinc-900 border-zinc-800 cursor-pointer" />
              <label className="text-micro text-zinc-400 cursor-pointer">
                Saya setuju dengan <span className="text-brand-amber font-bold">Kebijakan Hangus Mutlak 15 Menit</span>.
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-black font-black py-4 rounded-xl transition-all glow-emerald flex items-center justify-center gap-2 uppercase tracking-tight cursor-pointer disabled:opacity-50">
              {loading ? "MEMPROSES..." : "DAFTAR SEKARANG"}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-zinc-800/60 pt-4">
            <p className="text-zinc-500 text-xs">
              Sudah memiliki akun? <button onClick={() => router.push("/login")} className="text-foreground hover:text-brand-neon font-bold underline cursor-pointer">Masuk Sistem</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}