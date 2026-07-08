"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, MapPin, Star, Calendar, Zap, Filter } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

export default function MarketplaceClient({ initialVenues }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All");

  const sports = ["All", "Futsal", "Basketball", "Tennis", "Badminton"];

  const filteredVenues = (initialVenues || []).filter((venue) => {
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          venue.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === "All" || venue.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 mt-10 font-sans">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-8">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Cari arena atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-brand-emerald rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-200 font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold text-zinc-500 mr-2 uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter
          </span>
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all duration-200 cursor-pointer border",
                selectedSport === sport
                  ? "bg-brand-emerald text-black border-brand-emerald"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
              )}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-mono font-bold text-zinc-500 tracking-wider uppercase mb-6 flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-emerald animate-pulse" /> ARENA LIVE DATABASE ({filteredVenues.length})
        </h3>

        {filteredVenues.length === 0 ? (
           <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 font-mono text-xs">
             TIDAK ADA FASILITAS OLAHRAGA YANG COCOK DENGAN PENCARIAN ANDA.
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                onClick={() => router.push(`/venues/${venue.id}`)}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-brand-emerald/50 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden bg-zinc-950">
                  <Image
                    src={venue.image}
                    alt={venue.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md text-white text-[10px] font-mono px-2 py-1 rounded flex items-center gap-1 border border-zinc-800">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{venue.rating}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-brand-emerald tracking-widest uppercase block mb-2">
                      {venue.sport}
                    </span>
                    <h4 className="text-base font-bold text-white mb-1.5 line-clamp-1 group-hover:text-brand-emerald transition-colors font-display">
                      {venue.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-4">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                      <span className="truncate">{venue.location}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 block leading-none">START FROM</span>
                      <span className="text-xs font-mono font-bold text-white mt-1 block">{venue.price}</span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 group-hover:bg-brand-emerald group-hover:border-brand-emerald group-hover:text-black transition-all flex items-center justify-center text-zinc-500">
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