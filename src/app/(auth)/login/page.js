"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowRight, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
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

      // Routing Dinamis Berdasarkan Metadata JWT
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
          router.push("/"); // Default untuk CUSTOMER
      }

    } catch (err) {
      setError("Kredensial tidak valid. Akses basis data ditolak.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row relative overflow-hidden select-none font-sans bg-background">
      {/* LEFT SIDE */}
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
            DOMINATE THE <br/><span className="text-brand-emerald">COURT.</span>
          </h1>
          <p className="text-zinc-400 max-w-md leading-relaxed">
            The premium multi-tenant sports booking gateway. Sistem login kami diamankan dengan arsitektur JWT dan Role-Based Access Control.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="w-full md:w-1/2 min-h-full flex items-center justify-center p-6 md:p-12 lg:p-16 bg-black/40">
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
      </div>
    </div>
  );
}