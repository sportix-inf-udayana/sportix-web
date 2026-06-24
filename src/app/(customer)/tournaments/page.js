/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (customer)
 * Path: src/app/(customer)/tournaments/page.js
 * Deskripsi SRS: 
 * Pusat pendaftaran kompetisi dan turnamen olahraga lokal regional Bali. Memungkinkan perwakilan komunitas/tim 
 * untuk mengisi daftar susunan pemain (roster), memantau bracket pertandingan, serta menyelesaikan biaya pendaftaran 
 * turnamen secara terintegrasi.
 */

"use client";

import React, { useState } from "react";
import {
  Award,
  CheckCircle,
  Users,
  MapPin,
  Calendar,
  AlertTriangle,
  Send,
  Loader2
} from "lucide-react";

export default function TournamentsPage() {
  const [teamName, setTeamName] = useState("");
  const [playerList, setPlayerList] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName || !playerList) {
      alert("Harap lengkapi nama tim dan daftar roster pemain!");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTeamName("");
      setPlayerList("");
    }, 1500);
  };

  const navigateBack = () => {
    window.location.hash = "/profile/history";
    if (window.__sportixNavigate) {
      window.__sportixNavigate("/profile/history");
    }
  };

  return (
    <div className="bg-[#09090b] text-[#e5e2e1] min-h-screen pb-16 font-sans select-none">
    {/* Header Container */}
    <div className="border-b border-zinc-800 bg-[#0e0e0e] py-6 px-6">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
    <div className="flex items-center gap-3.5">
    <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 glow-emerald">
    <Award className="w-5 h-5" />
    </div>
    <div>
    <h1 className="text-2xl font-black text-white font-display">Athlete Dossier</h1>
    <p className="text-zinc-500 text-xs uppercase tracking-wider font-mono">
    Manage your competitive history and active passes
    </p>
    </div>
    </div>
    <button
    onClick={navigateBack}
    className="text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3.5 py-2 rounded text-zinc-400 hover:text-white transition-all cursor-pointer font-sans font-medium"
    >
    Kembali ke Dossier
    </button>
    </div>
    </div>

    {/* Tabs Row */}
    <div className="max-w-7xl mx-auto px-6 mt-8">
    <div className="flex border-b border-zinc-800/80 gap-6 mb-8">
    <button
    onClick={navigateBack}
    className="pb-4 text-sm font-semibold text-zinc-500 hover:text-zinc-300 cursor-pointer"
    >
    My Tickets
    </button>
    <button className="pb-4 text-sm font-bold text-emerald-400 relative">
    Tournaments
    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 glow-emerald" />
    </button>
    <button
    onClick={() => {
      window.location.hash = "/umkm";
      if (window.__sportixNavigate) {
        window.__sportixNavigate("/umkm");
      }
    }}
    className="pb-4 text-sm font-semibold text-zinc-500 hover:text-zinc-300 cursor-pointer"
    >
    Consignment Pro Shop
    </button>
    </div>

    {/* Form & Info Layout Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

    {/* Tournament card and registration form (7 Columns) */}
    <div className="lg:col-span-7 glass-panel rounded-2xl overflow-hidden shadow-2xl relative flex flex-col justify-between">
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 to-emerald-600 glow-emerald" />

    {/* Banner Photo */}
    <div className="relative h-56 bg-zinc-900">
    <img
    src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800"
    alt="Futsal Tournament Kickoff"
    className="w-full h-full object-cover opacity-30"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#131313] to-transparent" />
    <div className="absolute bottom-6 left-6">
    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider glow-emerald">
    Bali League Series
    </span>
    <h2 className="text-2xl font-black text-white mt-2 font-display">Denpasar Urban Futsal Cup</h2>
    <p className="text-zinc-400 text-xs mt-1 font-sans">
    Regional qualifiers for amateur squads. High-intensity elimination format.
    </p>
    </div>
    </div>

    {/* Content info */}
    <div className="p-6 space-y-6">
    <div>
    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3.5 flex items-center gap-1">
    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Registration Requirements
    </h4>
    <ul className="space-y-2 text-xs text-zinc-400 font-sans">
    <li className="flex items-center gap-2">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
    <span>Min. 5 players, max 12 per roster.</span>
    </li>
    <li className="flex items-center gap-2">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
    <span>KTP Bali required for all participants.</span>
    </li>
    <li className="flex items-center gap-2">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
    <span>Registration fee: IDR 500,000 / Team (Cashless transfer verified).</span>
    </li>
    </ul>
    </div>

    {/* Success Notification */}
    {success && (
      <div className="p-4 bg-emerald-950/40 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 space-y-1 font-sans">
      <h5 className="font-bold uppercase tracking-wider font-mono">Pendaftaran Berhasil Dikirim</h5>
      <p>Roster tim Anda telah dikunci. Pembayaran akan direkonsiliasi otomatis oleh Super Admin via ledger stream.</p>
      </div>
    )}

    {/* Roster Submission Form */}
    <form onSubmit={handleSubmit} className="space-y-4">
    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
    Roster Submission
    </h4>

    <div>
    <label className="text-[10px] font-mono text-zinc-400 block mb-1.5 uppercase">
    Team Name
    </label>
    <input
    type="text"
    value={teamName}
    onChange={(e) => setTeamName(e.target.value)}
    placeholder="e.g., Kuta Warriors FC"
    className="w-full bg-[#0e0e0e] border border-zinc-800 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-sm text-white placeholder-zinc-700 outline-none transition-all duration-200 font-sans"
    />
    </div>

    <div>
    <label className="text-[10px] font-mono text-zinc-400 block mb-1.5 uppercase">
    Player List (Format: Name - Jersey Number - Position)
    </label>
    <textarea
    rows={4}
    value={playerList}
    onChange={(e) => setPlayerList(e.target.value)}
    placeholder="1. Wayan Sudarma - #10 - Playmaker&#10;2. Made Sukarta - #7 - Winger&#10;3. Nyoman Gede - #1 - Goalkeeper"
    className="w-full bg-[#0e0e0e] border border-zinc-800 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-sm text-white placeholder-zinc-700 outline-none transition-all duration-200 font-mono resize-none leading-relaxed"
    />
    </div>

    <button
    type="submit"
    disabled={submitting}
    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 tracking-wider uppercase glow-emerald cursor-pointer"
    >
    {submitting ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <>
      <span>Submit Entry</span>
      <Send className="w-3.5 h-3.5" />
      </>
    )}
    </button>
    </form>
    </div>
    </div>

    {/* Sync status and side news (5 Columns) */}
    <div className="lg:col-span-5 space-y-6">
    <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center items-center py-12 text-center h-full min-h-[300px]">
    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4 animate-pulse">
    <Users className="w-5 h-5" />
    </div>
    <h4 className="text-zinc-400 font-bold text-sm">More events syncing...</h4>
    <p className="text-zinc-600 text-xs mt-1.5 max-w-xs leading-relaxed font-sans">
    Pembaruan turnamen lokal lainnya di Bali sedang disinkronisasikan oleh sistem. Tetap terhubung untuk registrasi piala berikutnya.
    </p>
    </div>
    </div>

    </div>
    </div>
    </div>
  );
}
