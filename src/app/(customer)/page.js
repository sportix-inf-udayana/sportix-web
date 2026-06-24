/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (customer)
 * Path: src/app/(customer)/page.js
 * Deskripsi SRS: 
 * Halaman utama (landing page) interaktif dan eksplorasi bagi pelanggan. Menyediakan visualisasi pencarian instan 
 * yang dilengkapi komponen penyaringan dinamis berdasarkan jenis cabang olahraga (Futsal, Badminton, Basket, dll) 
 * serta radius koordinat lokasi fasilitas olahraga di wilayah Bali.
 */

"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  Star,
  Calendar,
  Zap,
  Compass,
  ShieldAlert,
  Filter
} from "lucide-react";

export default function CustomerMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All");

  const sports = ["All", "Futsal", "Basketball", "Tennis", "Badminton"];

  const venues = [
    {
      id: "academy-stadium",
      name: "Academy Stadium",
      location: "Downtown Complex, Denpasar",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800",
      rating: 4.9,
      reviews: 142,
      price: "IDR 150,000 / Jam",
      sport: "Futsal",
      tags: ["Elite Turf", "Floodlit", "Indoor 5v5"],
      isPopular: true
    },
    {
      id: "sunset-court",
      name: "Seminyak Sunset Arena",
      location: "Sunset Road, Seminyak",
      image: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=800",
      rating: 4.8,
      reviews: 96,
      price: "IDR 200,000 / Jam",
      sport: "Basketball",
      tags: ["Wooden Court", "Standard FIBA"],
      isPopular: true
    },
    {
      id: "sanur-tennis-club",
      name: "Sanur Clay Tennis Club",
      location: "Bypass Ngurah Rai, Sanur",
      image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=800",
      rating: 4.7,
      reviews: 58,
      price: "IDR 120,000 / Jam",
      sport: "Tennis",
      tags: ["Clay Court", "Pro Coaching Available"]
    },
    {
      id: "ubud-badminton-hall",
      name: "Ubud Peak Badminton Hall",
      location: "Monkey Forest Street, Ubud",
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800",
      rating: 4.6,
      reviews: 39,
      price: "IDR 80,000 / Jam",
      sport: "Badminton",
      tags: ["Premium Mats", "High Ceiling"]
    }
  ];

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === "All" || venue.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const navigateToVenue = (venueId) => {
    window.location.hash = `/venues/${venueId}`;
    if (window.__sportixNavigate) {
      window.__sportixNavigate(`/venues/${venueId}`);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans">
      {/* Immersive Hero Header */}
      <div className="relative h-[420px] overflow-hidden flex items-end">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200"
            alt="Academy Stadium Evening"
            className="w-full h-full object-cover filter brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full pb-10 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-neon/10 border border-brand-neon/20 rounded-full text-xs text-brand-neon mb-4">
            <Compass className="w-3 h-3 animate-spin" />
            <span className="font-mono tracking-wider uppercase">Daftar Arena Terverifikasi</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 font-display">
            Exploration <span className="text-brand-emerald">Engine</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed">
            Temukan dan pesan lapangan olahraga premium dengan sistem penguncian slot otomatis. 100% Cashless, 100% Akuntabel.
          </p>
        </div>
      </div>

      {/* Strict Forfeit Policy Bar */}
      <div className="bg-surface-hover border-y border-zinc-800 py-3.5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-amber/10 flex items-center justify-center border border-brand-amber/20 text-brand-amber glow-amber">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-zinc-300">
                <span className="text-brand-amber font-bold uppercase font-mono tracking-wider">KEBIJAKAN NO-SHOW: </span>
                Terlambat masuk <span className="text-brand-amber font-bold">&gt;15 menit</span> menghanguskan tiket secara sepihak, dana disita 100%, dan slot sisa dirilis otomatis ke status <span className="text-brand-neon font-bold">AVAILABLE</span>.
              </p>
            </div>
          </div>
          <div className="bg-background px-3 py-1 rounded border border-zinc-800 text-micro font-mono text-zinc-500">
            SECURE CASHLESS PROTOCOL
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        {/* Search & Filter bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-8">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari arena, kompleks, atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-zinc-800 focus:border-brand-emerald rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-200 font-sans"
            />
          </div>

          {/* Sport Categories */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-zinc-500 mr-2 uppercase flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {sports.map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                  selectedSport === sport
                    ? "bg-brand-emerald text-black font-bold glow-emerald"
                    : "bg-surface border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {sport}
                </button>
            ))}
          </div>
        </div>

        {/* Arenas Grid */}
        <div>
          <h3 className="text-xs font-mono text-zinc-500 tracking-wider uppercase mb-6 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-brand-neon animate-pulse" /> ARENA TERSEDIA ({filteredVenues.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                onClick={() => navigateToVenue(venue.id)}
                className="glass-panel rounded-2xl overflow-hidden hover:border-brand-emerald/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(16,185,129,0.1)] flex flex-col group cursor-pointer"
              >
                {/* Image & Badges */}
                <div className="relative h-48 overflow-hidden bg-zinc-950">
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {venue.isPopular && (
                    <div className="absolute top-3 left-3 bg-brand-emerald text-black text-micro font-mono font-black px-2 py-0.5 rounded tracking-wider uppercase glow-emerald">
                      POPULAR
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-foreground text-micro font-mono px-2 py-0.5 rounded flex items-center gap-1 border border-zinc-800">
                    <Star className="w-3 h-3 text-brand-amber fill-brand-amber" />
                    <span>{venue.rating}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-micro font-mono text-zinc-500 tracking-widest uppercase block mb-1">
                      {venue.sport}
                    </span>
                    <h4 className="text-base font-bold text-foreground mb-1.5 line-clamp-1 group-hover:text-brand-neon transition-colors font-display">
                      {venue.name}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-zinc-500 mb-4">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                      <span className="truncate">{venue.location}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {venue.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-surface-hover text-zinc-400 text-micro px-2 py-0.5 rounded font-mono border border-zinc-800/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-micro font-mono text-zinc-500 block leading-none">START FROM</span>
                      <span className="text-xs font-mono font-bold text-brand-neon mt-1 block">{venue.price}</span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-brand-emerald group-hover:text-black transition-all flex items-center justify-center text-zinc-400 group-hover:glow-emerald">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}