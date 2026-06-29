"use client";

import React, { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Building2, Phone, FileText, UserCircle2, LogOut } from "lucide-react";

export default function OnboardingClient({ user }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("venues").insert({
        owner_id: user.id,
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        description: formData.description,
        status: "PENDING",
      });

      if (insertError) throw insertError;

      router.refresh();
      router.push("/admin-venue/slots"); 
    } catch (err) {
      setError(err.message || "Gagal menyimpan data arena.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header Profile & Logout (Konsisten dengan Dasbor) */}
      <div className="flex items-center justify-between mb-8 bg-surface p-4 rounded-2xl border border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <UserCircle2 className="w-6 h-6 text-brand-slate" />
          </div>
          <div>
            <p className="text-xs font-mono text-zinc-500 uppercase">Onboarding Session</p>
            <p className="text-sm font-bold text-white">{user?.user_metadata?.full_name || user.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Main Card Form */}
      <div className="bg-surface border border-zinc-800 rounded-3xl p-8 md:p-10 shadow-xl">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white font-display">Registrasi Entitas Arena</h2>
          <p className="text-zinc-400 text-xs mt-2 font-sans">
            Lengkapi data operasional fasilitas olahraga Anda. Data ini akan diaudit oleh Super Admin sebelum diintegrasikan ke sistem publik Sportix.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-950/30 border border-red-500/20 rounded-xl text-xs font-mono text-red-400">
              [SYS_ERROR] {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-micro font-bold text-zinc-500 uppercase tracking-widest font-mono">Nama Fasilitas Resmi</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Contoh: GOR Udayana Jimbaran" className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-emerald transition-colors font-mono" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-micro font-bold text-zinc-500 uppercase tracking-widest font-mono">Alamat Lengkap</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input type="text" name="address" required value={formData.address} onChange={handleChange} placeholder="Jl. Raya Kampus Unud, Jimbaran" className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-emerald transition-colors font-mono" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-micro font-bold text-zinc-500 uppercase tracking-widest font-mono">Kontak Operasional</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+62 812-3456-7890" className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-emerald transition-colors font-mono" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-micro font-bold text-zinc-500 uppercase tracking-widest font-mono">Deskripsi & Fasilitas</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <textarea name="description" required rows={4} value={formData.description} onChange={handleChange} placeholder="Contoh: 5 lapangan tenis, lantai vinyl, area parkir luas..." className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-emerald transition-colors resize-none font-mono" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-brand-emerald text-black font-black text-sm rounded-xl hover:bg-brand-emerald/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 glow-emerald uppercase tracking-tight">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>MENYIMPAN DOKUMEN...</span>
              </>
            ) : (
              <span>AJUKAN VERIFIKASI ARENA</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}