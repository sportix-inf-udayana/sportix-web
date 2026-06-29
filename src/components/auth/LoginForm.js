"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { AlertTriangle } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Tangkap jejak rute dari middleware
  const callbackUrl = searchParams.get("callback");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password wajib diisi!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Prioritaskan Callback URL jika ada 
      if (callbackUrl) {
        router.push(callbackUrl);
        return; 
      }

      // Jika tidak ada callback, gunakan routing bawaan berbasis Role
      const userRole = data.user.user_metadata?.role;
      switch (userRole) {
        case "SUPER_ADMIN":
          router.push("/super-admin/verifications");
          break;
        case "ADMIN_VENUE":
          router.push("/admin-venue/slots");
          break;
        case "COACH":
          router.push("/coach/schedule");
          break;
        case "UMKM_SELLER":
          router.push("/seller-umkm/products");
          break;
        default:
          router.push("/");
      }

    } catch (err) {
      setError("Kredensial tidak valid. Akses basis data ditolak.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel w-full max-w-md p-8 md:p-10 rounded-3xl glow-emerald relative">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-foreground font-display">Masuk Sistem</h2>
        <p className="text-zinc-400 text-xs mt-1">Autentikasi sesi aman (Secure Session).</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-micro font-bold text-zinc-500 uppercase tracking-widest font-mono">Email Address</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="atlet@sportix.com" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-foreground outline-none focus:border-brand-emerald transition-colors font-mono" />
        </div>

        <div className="space-y-2">
          <label className="text-micro font-bold text-zinc-500 uppercase tracking-widest font-mono">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-foreground outline-none focus:border-brand-emerald transition-colors font-mono" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-black font-black py-4 rounded-xl transition-all glow-emerald flex items-center justify-center gap-2 uppercase tracking-tight cursor-pointer disabled:opacity-50">
          {loading ? "MEMVALIDASI JWT..." : "MASUK SISTEM"}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-zinc-800/60 pt-4">
        <p className="text-zinc-500 text-xs">
          Belum memiliki akun? <button onClick={() => router.push("/register")} className="text-foreground hover:text-brand-neon font-bold underline cursor-pointer">Daftar Sekarang</button>
        </p>
      </div>
    </div>
  );
}