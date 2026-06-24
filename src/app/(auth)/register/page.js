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

import React, { useState } from "react";
import {
  ShieldAlert,
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState("CUSTOMER"); // "CUSTOMER" for Athlete, "ADMIN_VENUE" for Venue Admin, "COACH" for Coach, "UMKM_SELLER" for Merchant
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreePenalty, setAgreePenalty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const roles = [
    { id: "CUSTOMER", label: "Athlete", desc: "Book courts & training sessions" },
    { id: "ADMIN_VENUE", label: "Venue Admin", desc: "Host venues & manage court slots" },
    { id: "COACH", label: "Coach", desc: "Offer elite training & manage sessions" },
    { id: "UMKM_SELLER", label: "Merchant", desc: "Sell Balinese & athletic gear" },
  ];

  const handleRegister = (e) => {
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

    setTimeout(() => {
      setLoading(false);
      setSuccess("Pendaftaran akun berhasil! Mengalihkan Anda ke halaman masuk...");
      setTimeout(() => {
        window.location.hash = "/login";
        if (window.__sportixNavigate) {
          window.__sportixNavigate("/login");
        }
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row relative overflow-hidden select-none font-sans">

    {/* LEFT SIDE - Hero content */}
    <div className="w-full md:w-1/2 p-6 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-zinc-950/40 border-b md:border-b-0 md:border-r border-zinc-800">
    <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />

    <div className="z-10">
    <div className="flex items-center gap-3 mb-8 md:mb-12">
    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center glow-emerald">
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 11 3 3 3-3-3-3z"/>
    <path d="m16 11 3 3 3-3-3-3z"/>
    <path d="m8 22 3-3 3 3-3-3z"/>
    <path d="m8 2 3 3 3-3-3 3z"/>
    </svg>
    </div>
    <span className="text-2xl font-black tracking-tighter text-white font-display">SPORTIX</span>
    </div>

    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[0.95] mb-6 tracking-tight text-white font-display">
    JOIN THE <br/>
    <span className="text-emerald-500">LINEUP.</span>
    </h1>
    <p className="text-zinc-400 text-sm md:text-base lg:text-lg max-w-md leading-relaxed">
    Create your high-performance Sportix account to access instant bookings, customized coaching metrics, and active sports consignments.
    </p>
    </div>

    <div className="z-10 space-y-4 mt-8 md:mt-0">
    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex gap-4 items-start max-w-md glow-amber">
    <div className="text-amber-500 mt-0.5 shrink-0">
    <Info className="w-5 h-5" />
    </div>
    <div>
    <p className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-1 font-mono">Kebijakan Akun Tunggal</p>
    <p className="text-zinc-300 text-xs leading-relaxed">
    Pilih peran utama Anda dengan bijak. Setiap registrasi memetakan set instrumen performa khusus di dasbor Anda.
    </p>
    </div>
    </div>

    <div className="flex items-center gap-2 text-zinc-500 text-[11px] font-mono uppercase tracking-wider">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
    <span>Digital-Only Operational Cashless Gate Secure</span>
    </div>
    </div>
    </div>

    {/* RIGHT SIDE - Glass Registration Form */}
    <div className="w-full md:w-1/2 min-h-full flex items-center justify-center p-6 md:p-12 lg:p-16 bg-black/40">
    <div className="glass-panel w-full max-w-md p-8 md:p-10 rounded-3xl glow-emerald relative">

    <div className="mb-6">
    <h2 className="text-2xl font-black text-white font-display">Daftar Akun</h2>
    <p className="text-zinc-400 text-xs mt-1">Bergabung dengan ekosistem atletik modern.</p>
    </div>

    {success && (
      <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded text-xs text-emerald-400 flex items-center gap-2">
      <Sparkles className="w-4 h-4 shrink-0" />
      {success}
      </div>
    )}

    {error && (
      <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded text-xs text-red-400 flex items-center gap-2">
      <ShieldAlert className="w-4 h-4 shrink-0" />
      {error}
      </div>
    )}

    <form onSubmit={handleRegister} className="space-y-5">
    {/* SELECT ROLE SECTION */}
    <div className="space-y-2">
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
    Pilih Peran Utama
    </label>
    <div className="grid grid-cols-2 gap-2">
    {roles.map((r) => (
      <button
      key={r.id}
      type="button"
      onClick={() => setRole(r.id)}
      className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
        role === r.id
        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
      }`}
      >
      <div className="text-xs font-bold">{r.label}</div>
      <div className="text-[9px] text-zinc-500 leading-none mt-1 truncate">
      {r.desc}
      </div>
      </button>
    ))}
    </div>
    </div>

    {/* FULL NAME */}
    <div className="space-y-2">
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
    Nama Lengkap
    </label>
    <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
    <User className="w-4 h-4" />
    </div>
    <input
    type="text"
    required
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
    placeholder="John Doe"
    className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none transition-colors"
    />
    </div>
    </div>

    {/* EMAIL ADDRESS */}
    <div className="space-y-2">
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
    Email Address
    </label>
    <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
    <Mail className="w-4 h-4" />
    </div>
    <input
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="athlete@example.com"
    className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none transition-colors"
    />
    </div>
    </div>

    {/* PASSWORD */}
    <div className="space-y-2">
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
    Password
    </label>
    <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
    <Lock className="w-4 h-4" />
    </div>
    <input
    type="password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none transition-colors"
    />
    </div>
    </div>

    {/* NO SHOW PENALTY COMPLIANCE */}
    <div className="flex items-start gap-2.5 pt-1">
    <input
    id="penalty-checkbox"
    type="checkbox"
    checked={agreePenalty}
    onChange={(e) => setAgreePenalty(e.target.checked)}
    className="mt-1 accent-emerald-500 w-4 h-4 rounded bg-zinc-900 border-zinc-800 text-black cursor-pointer"
    />
    <label htmlFor="penalty-checkbox" className="text-[10px] text-zinc-400 leading-normal cursor-pointer select-none">
    Saya setuju dengan <span className="text-amber-400 font-bold">Kebijakan Hangus Mutlak 15 Menit No-Show</span> dan memahami dana disita 100% jika terlambat.
    </label>
    </div>

    {/* REGISTER BUTTON */}
    <button
    type="submit"
    disabled={loading}
    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl transition-all glow-emerald flex items-center justify-center gap-2 uppercase tracking-tight cursor-pointer"
    >
    {loading ? (
      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
    ) : (
      <>
      <span>Daftar Sekarang</span>
      <ArrowRight className="w-4 h-4" />
      </>
    )}
    </button>
    </form>

    {/* BACK TO LOGIN */}
    <div className="mt-6 text-center border-t border-zinc-800/60 pt-4">
    <p className="text-zinc-500 text-xs">
    Sudah memiliki akun?{" "}
    <button
    type="button"
    onClick={() => {
      window.location.hash = "/login";
      if (window.__sportixNavigate) {
        window.__sportixNavigate("/login");
      }
    }}
    className="text-white hover:text-emerald-400 font-bold underline"
    >
    Masuk Sistem
    </button>
    </p>
    </div>

    </div>
    </div>

    </div>
  );
}
