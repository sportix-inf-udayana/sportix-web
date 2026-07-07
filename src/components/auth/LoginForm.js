"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

// Inisialisasi di luar komponen agar tidak dibuat ulang setiap re-render
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

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data?.user) {
        const role = data.user.user_metadata?.role || "CUSTOMER";
        const callbackUrl = searchParams.get("callback");
        
        const destination = callbackUrl 
          ? decodeURIComponent(callbackUrl) 
          : (ROLE_REDIRECTS[role] || "/");

        router.refresh();
        router.push(destination);
      }
    } catch (err) {
      console.error("Authentication Failure:", err);
      setErrorMessage(err.message || "Email atau password yang Anda masukkan salah.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5 w-full max-w-sm">
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">Alamat Email</label>
        <div className="relative">
          <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
          <input 
            type="email" 
            required
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@unud.ac.id" 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 disabled:opacity-50 transition-colors font-sans"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">Kata Sandi</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
          <input 
            type="password" 
            required
            disabled={isLoading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 disabled:opacity-50 transition-colors font-sans"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black disabled:text-zinc-600 py-3 rounded-lg text-sm font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-black/10"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>MEMVALIDASI SESI...</span>
          </>
        ) : (
          <>
            <span>MASUK KE SISTEM</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}