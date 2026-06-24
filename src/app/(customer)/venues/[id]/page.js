/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (customer)
 * Path: src/app/(customer)/venues/[id]/page.js
 * Deskripsi SRS: 
 * Halaman profil detail dari suatu tempat olahraga (venue ID spesifik). Menampilkan deskripsi fasilitas, rating, 
 * dokumentasi fisik, daftar inventaris alat penunjang komersial (pro-shop), daftar instruktur/pelatih yang terafiliasi, 
 * serta papan informasi turnamen terdekat yang sedang aktif di lokasi tersebut.
 */

"use client";

import React from "react";
import {
  ArrowLeft,
  MapPin,
  Star,
  Shield,
  Award,
  Layers,
  Flame,
  Share2,
  Heart,
  Calendar,
  AlertCircle
} from "lucide-react";

export default function VenueDetailPage() {
  const navigateBack = () => {
    window.location.hash = "/";
    if (window.__sportixNavigate) {
      window.__sportixNavigate("/");
    }
  };

  const navigateToBooking = () => {
    window.location.hash = "/booking/academy-stadium";
    if (window.__sportixNavigate) {
      window.__sportixNavigate("/booking/academy-stadium");
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans">
      {/* Header Bar */}
      <div className="border-b border-zinc-800 bg-surface-elevated py-4 px-6 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={navigateBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Exploration</span>
          </button>
          <div className="flex gap-2">
            <button className="p-2 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all">
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        {/* Gallery / Cover Image */}
        <div className="relative h-[480px] rounded-xl overflow-hidden mb-8 group shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200"
            alt="Academy Stadium Pitch"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-brand-emerald text-black text-micro font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider glow-emerald">
                  Verified Elite Complex
                </span>
                <span className="bg-surface-card border border-zinc-800 text-foreground text-micro font-mono px-2 py-0.5 rounded">
                  Downtown Complex
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 font-display">
                Academy Stadium
              </h1>
              <div className="flex items-center gap-4 text-sm text-zinc-300 font-sans">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>Jalan Sunset Raya No. 42, Denpasar, Bali</span>
                </div>
                <div className="flex items-center gap-1 text-brand-amber">
                  <Star className="w-4 h-4 fill-brand-amber text-brand-amber" />
                  <span className="font-bold">4.9</span>
                  <span className="text-zinc-500 text-xs">(142 Ulasan)</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl text-right hidden md:block">
              <span className="text-micro font-mono text-zinc-500 block uppercase">HARGA MULAI</span>
              <span className="text-2xl font-mono font-black text-brand-neon block my-0.5">IDR 150.000</span>
              <span className="text-micro text-zinc-400 block font-sans">per slot (1 Jam)</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Specs & Details (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 font-display">Spesifikasi Arena & Kelayakan</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-background rounded border border-zinc-800/60 flex items-center gap-3">
                  <Layers className="w-5 h-5 text-brand-neon" />
                  <div>
                    <span className="text-micro font-mono text-zinc-500 block uppercase">JENIS LAPANGAN</span>
                    <span className="text-xs font-bold text-foreground">Synthetic 5v5 Turf</span>
                  </div>
                </div>
                <div className="p-3 bg-background rounded border border-zinc-800/60 flex items-center gap-3">
                  <Award className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="text-micro font-mono text-zinc-500 block uppercase">RATING PLATFORM</span>
                    <span className="text-xs font-bold text-foreground">Tier Elite Arena</span>
                  </div>
                </div>
                <div className="p-3 bg-background rounded border border-zinc-800/60 flex items-center gap-3">
                  <Flame className="w-5 h-5 text-brand-amber" />
                  <div>
                    <span className="text-micro font-mono text-zinc-500 block uppercase">FASILITAS UTAMA</span>
                    <span className="text-xs font-bold text-foreground">Floodlit 1000W</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-sm text-zinc-400 leading-relaxed space-y-4 font-sans">
                <p>
                  Academy Stadium merupakan stadion indoor modern di jantung kota Denpasar yang didesain khusus untuk melatih performa atlet terbaik. Menggunakan rumput sintetis berstandar FIFA dengan ketebalan prima yang mampu meminimalisir cedera persendian kaki.
                </p>
                <p>
                  Dilengkapi dengan sistem pencahayaan LED Floodlights berkekuatan tinggi serta tribune penonton eksklusif yang mampu menampung hingga 50 supporter. Nikmati kenyamanan toilet pribadi, shower air panas, dan area loker steril terenkripsi.
                </p>
              </div>
            </div>

            {/* Strict Rules */}
            <div className="bg-surface-hover border border-brand-amber/20 rounded-xl p-6">
              <h3 className="text-brand-amber text-sm font-bold font-mono tracking-wider uppercase mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-brand-amber" /> Kepatuhan Hukum & Regulasi Bermain (SLA)
              </h3>
              <ul className="space-y-3.5 text-xs text-zinc-400 font-sans">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-amber shrink-0 mt-1.5" />
                  <span>
                    <strong className="text-white">Kebijakan Hangus 15 Menit:</strong> Terlambat masuk &gt;15 menit menghanguskan tiket secara sepihak, dana disita 100%, dan slot sisa dirilis otomatis kembali ke status AVAILABLE.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-amber shrink-0 mt-1.5" />
                  <span>
                    <strong className="text-white">Gerbang Digital Cashless:</strong> Kami tidak menerima pembayaran uang tunai atau rekonsiliasi manual di tempat. Semua transaksi harus dilakukan via kartu debit/kredit/QRIS terenkripsi.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-amber shrink-0 mt-1.5" />
                  <span>
                    <strong className="text-white">Prosedur Tiket & Check-in:</strong> QR Code e-ticket harus ditunjukkan kepada kamera scanner di pintu masuk lapangan sebelum waktu bermain dimulai.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Booking Action Card (1 Col) */}
          <div>
            <div className="glass-panel rounded-2xl p-6 sticky top-24 shadow-2xl">
              <h3 className="text-xs font-mono text-zinc-500 tracking-wider uppercase mb-4">
                BOOKING RESERVATION
              </h3>

              <div className="bg-surface-elevated border border-zinc-800 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                  <span className="text-xs text-zinc-400">Pilihan Sesi</span>
                  <span className="text-xs text-foreground font-mono">1 Jam (Per Slot)</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-xs text-zinc-400">Gate Masuk</span>
                  <span className="text-xs text-brand-neon font-mono">Digital Self-Scan Gate A</span>
                </div>
              </div>

              <div className="space-y-3.5 mb-6">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-sans">
                  <Shield className="w-4 h-4 text-brand-emerald shrink-0" />
                  <span>Konfirmasi slot instan & aman</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-sans">
                  <Calendar className="w-4 h-4 text-brand-amber shrink-0" />
                  <span>Buka 24 jam setiap hari</span>
                </div>
              </div>

              <button
                onClick={navigateToBooking}
                className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 tracking-wide text-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] glow-emerald cursor-pointer"
              >
                <span>Pilih Tanggal & Jam</span>
                <Calendar className="w-4 h-4" />
              </button>

              <div className="text-center mt-4">
                <span className="text-micro text-zinc-600 font-mono uppercase">
                  Sportix Velocity Secure Engine
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}