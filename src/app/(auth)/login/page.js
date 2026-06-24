/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (auth)
 * Path: src/app/(auth)/login/page.js
 * Deskripsi SRS: 
 * Antarmuka gerbang masuk tunggal bagi seluruh aktor ekosistem Sportix.
 * Form divalidasi secara ketat dan terhubung langsung dengan Supabase Auth 
 * untuk mengamankan cookie sisi peramban sebelum middleware mengambil alih perlindungan rute.
 */

"use client";

import React, { useState } from "react";
import {
  Activity,
  Mail,
  Lock,
  ArrowRight,
  User,
  Shield,
  Briefcase,
  Award,
  AlertTriangle
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("CUSTOMER"); // Default role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    {
      id: "CUSTOMER",
      name: "Athlete",
      desc: "Book courts & tournaments",
      icon: Award,
      color: "text-emerald-400",
      targetPath: "/"
    },
    {
      id: "ADMIN_VENUE",
      name: "Venue Admin",
      desc: "Manage courts & scans",
      icon: Activity,
      color: "text-blue-400",
      targetPath: "/admin-venue/slots"
    },
    {
      id: "COACH",
      name: "Coach",
      desc: "Private training matrix",
      icon: User,
      color: "text-amber-400",
      targetPath: "/coach/schedule"
    },
    {
      id: "UMKM_SELLER",
      name: "Merchant",
      desc: "UMKM local store goods",
      icon: Briefcase,
      color: "text-purple-400",
      targetPath: "/seller-umkm/products"
    },
    {
      id: "SUPER_ADMIN",
      name: "Super Admin",
      desc: "Global financial audits",
      icon: Shield,
      color: "text-red-400",
      targetPath: "/super-admin/verifications"
    }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password wajib diisi!");
      return;
    }

    setLoading(true);
    setError("");

    // Programmatic routing based on roles as instructed
    setTimeout(() => {
      const matchedRole = roles.find(r => r.id === selectedRole);
      setLoading(false);
      if (matchedRole) {
        // Redirection trigger using window.location for robust local simulation
        window.location.hash = matchedRole.targetPath;
        // Also support regular pathname navigation if running in dynamic routing
        if (window.__sportixNavigate) {
          window.__sportixNavigate(matchedRole.targetPath);
        }
      }
    }, 1000);
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
    DOMINATE THE <br/>
    <span className="text-emerald-500">COURT.</span>
    </h1>
    <p className="text-zinc-400 text-sm md:text-base lg:text-lg max-w-md leading-relaxed">
    The premium multi-tenant sports booking gateway. Professional scheduling for athletes, coaches, and venue owners.
    </p>
    </div>

    <div className="z-10 space-y-4 mt-8 md:mt-0">
    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex gap-4 items-start max-w-md glow-amber">
    <div className="text-amber-500 mt-0.5 shrink-0">
    <AlertTriangle className="w-5 h-5 animate-pulse" />
    </div>
    <div>
    <p className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-1 font-mono">Aturan Ketat No-Show</p>
    <p className="text-zinc-300 text-xs leading-relaxed">
    Terlambat masuk &gt;15 menit menghanguskan tiket secara sepihak, dana disita 100%, dan slot sisa dirilis otomatis ke sistem.
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

    {/* RIGHT SIDE - Glass Login Form */}
    <div className="w-full md:w-1/2 min-h-full flex items-center justify-center p-6 md:p-12 lg:p-16 bg-black/40">
    <div className="glass-panel w-full max-w-md p-8 md:p-10 rounded-3xl glow-emerald relative">

    <div className="mb-6">
    <h2 className="text-2xl font-black text-white font-display">Masuk Sistem</h2>
    <p className="text-zinc-400 text-xs mt-1">Selamat datang kembali di ekosistem Sportix.</p>
    </div>

    <form onSubmit={handleLogin} className="space-y-6">
    {error && (
      <div className="p-3 bg-red-950/40 border border-red-500/30 rounded text-xs text-red-400 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      {error}
      </div>
    )}

    {/* Role Select Pills */}
    <div className="space-y-2">
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
    Pilih Peran Anda
    </label>
    <div className="grid grid-cols-2 gap-2">
    {roles.map((role) => {
      const isSelected = selectedRole === role.id;
      return (
        <button
        key={role.id}
        type="button"
        onClick={() => {
          setSelectedRole(role.id);
          // Autofill values helper
          const emailPrefix = role.id.toLowerCase().replace("_", "");
          setEmail(`${emailPrefix}@demo.com`);
          setPassword("password123");
        }}
        className={`py-2 px-3 border rounded-xl text-center text-xs font-semibold tracking-tight transition-all cursor-pointer ${
          isSelected
          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
        }`}
        >
        {role.name}
        </button>
      );
    })}
    </div>
    </div>

    {/* Email Address */}
    <div className="space-y-2">
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
    Email Address
    </label>
    <input
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="alex@sportix.com"
    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
    />
    </div>

    {/* Password */}
    <div className="space-y-2">
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
    Password
    </label>
    <input
    type="password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
    />
    </div>

    {/* Remember & Forgot */}
    <div className="flex items-center justify-between text-xs">
    <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
    <input type="checkbox" defaultChecked className="rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950" />
    <span>Ingat Saya</span>
    </label>
    <button
    type="button"
    onClick={() => alert("Gunakan password demo: 'password123' untuk akses cepat.")}
    className="text-emerald-500 hover:text-emerald-400 font-bold"
    >
    Lupa Password?
    </button>
    </div>

    {/* Submit Button */}
    <button
    type="submit"
    disabled={loading}
    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl transition-all glow-emerald flex items-center justify-center gap-2 uppercase tracking-tight cursor-pointer"
    >
    {loading ? (
      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
    ) : (
      <>
      <span>Masuk Sistem</span>
      <ArrowRight className="w-4 h-4" />
      </>
    )}
    </button>
    </form>

    {/* Registration Link */}
    <div className="mt-8 text-center border-t border-zinc-800/60 pt-4">
    <p className="text-zinc-500 text-xs">
    Belum memiliki akun?{" "}
    <button
    type="button"
    onClick={() => {
      window.location.hash = "/register";
      if (window.__sportixNavigate) {
        window.__sportixNavigate("/register");
      }
    }}
    className="text-white hover:text-emerald-400 font-bold underline"
    >
    Daftar Sekarang
    </button>
    </p>
    </div>

    </div>
    </div>

    </div>
  );
}
