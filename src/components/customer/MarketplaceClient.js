"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, MapPin, Star, Calendar, Zap, Filter } from "lucide-react";

export default function MarketplaceClient({ initialVenues }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All");

  const sports = ["All", "Futsal", "Basketball", "Tennis", "Badminton"];

  const filteredVenues = initialVenues.filter((venue) => {
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          venue.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === "All" || venue.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 mt-10">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-8">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-slate">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Cari arena atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-brand-slate/20 focus:border-brand-emerald rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-brand-slate outline-none transition-all duration-200 font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-brand-slate mr-2 uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border ${
                selectedSport === sport
                  ? "bg-brand-emerald text-black font-bold border-brand-emerald"
                  : "bg-surface border-brand-slate/20 text-brand-slate hover:border-brand-slate/50 hover:text-white"
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-mono text-brand-slate tracking-wider uppercase mb-6 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-brand-neon animate-pulse" /> ARENA LIVE DATABASE ({filteredVenues.length})
        </h3>

        {filteredVenues.length === 0 ? (
           <div className="text-center py-20 border border-dashed border-brand-slate/20 rounded-xl text-brand-slate font-mono text-sm">
             Tidak ada fasilitas olahraga yang cocok dengan pencarian Anda.
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                onClick={() => router.push(`/venues/${venue.id}`)}
                className="bg-surface-elevated border border-brand-slate/20 rounded-2xl overflow-hidden hover:border-brand-emerald/50 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden bg-surface">
                  <Image
                    src={venue.image}
                    alt={venue.name}
                    fill
                    sizes="100vw"
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-micro font-mono px-2 py-0.5 rounded flex items-center gap-1 border border-brand-slate/20">
                    <Star className="w-3 h-3 text-brand-amber fill-brand-amber" />
                    <span>{venue.rating}</span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-micro font-mono text-brand-slate tracking-widest uppercase block mb-1">
                      {venue.sport}
                    </span>
                    <h4 className="text-base font-bold text-white mb-1.5 line-clamp-1 group-hover:text-brand-neon transition-colors font-display">
                      {venue.name}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-brand-slate mb-4">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-brand-slate" />
                      <span className="truncate">{venue.location}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-brand-slate/20 flex items-center justify-between mt-4">
                    <div>
                      <span className="text-micro font-mono text-brand-slate block leading-none">START FROM</span>
                      <span className="text-xs font-mono font-bold text-brand-neon mt-1 block">{venue.price}</span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-surface border border-brand-slate/20 group-hover:bg-brand-emerald group-hover:text-black transition-all flex items-center justify-center text-brand-slate">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}