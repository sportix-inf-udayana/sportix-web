"use client";

import React, { useState, useEffect } from "react";
import { Clock, Plus, Trash2, AlertCircle, Loader2, Calendar } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getSupabase } from "@/lib/supabase";

const cn = (...inputs) => twMerge(clsx(inputs));

export default function SlotMatrixClient({ initialFields }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = getSupabase();

  useEffect(() => {
    let isMounted = true;
    const fetchSlots = async () => {
      try {
        if (!initialFields || initialFields.length === 0) {
          throw new Error("Tidak ada fasilitas aktif di bawah wewenang Anda.");
        }

        const fieldIds = initialFields.map(f => f.id);

        const { data: slotData, error: slotError } = await supabase
          .from("venue_slots")
          .select("*")
          .in("field_id", fieldIds) // Eksekusi multi-tenant filter yang aman
          .order("day_of_week")
          .order("start_time");

        if (slotError) throw slotError;
        if (isMounted) setSlots(slotData || []);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSlots();
    return () => { isMounted = false; };
  }, [supabase, initialFields]);

  const handleAddSlot = () => {
    alert("Fitur penambahan slot manual akan segera dikembangkan (Work in Progress).");
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Hapus slot ini dari sistem?")) return;
    try {
      const { error: delError } = await supabase.from("venue_slots").delete().eq("id", slotId);
      if (delError) throw delError;
      setSlots(prev => prev.filter(s => s.id !== slotId));
    } catch (err) {
      alert("Gagal menghapus slot: " + err.message);
    }
  };

  const getDayName = (dayNum) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[dayNum] || "Unknown";
  };

  return (
    <div className="space-y-6 w-full text-white font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display uppercase">Manajemen Slot Waktu</h1>
          <p className="text-zinc-500 text-xs font-mono mt-1">Kontrol ketersediaan arena secara real-time.</p>
        </div>
        <button 
          onClick={handleAddSlot}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>TAMBAH SLOT</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="h-40 flex flex-col items-center justify-center gap-3 border border-zinc-800 border-dashed rounded-xl text-blue-500">
           <Loader2 className="w-6 h-6 animate-spin" />
           <span className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-500">MENGUNDUH KONFIGURASI SLOT...</span>
        </div>
      ) : slots.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center gap-3 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/50">
           <Calendar className="w-8 h-8 text-zinc-700" />
           <span className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-500">TIDAK ADA SLOT AKTIF</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {slots.map(slot => (
            <div key={slot.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 group hover:border-blue-500/50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-500/10 p-1.5 rounded-md border border-blue-500/20">
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white font-mono uppercase">{getDayName(slot.day_of_week)}</h3>
                    <p className="text-zinc-500 font-mono text-xs mt-0.5">
                      {slot.start_time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border tracking-widest",
                  slot.is_available 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                  {slot.is_available ? 'AVAILABLE' : 'BOOKED'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 mt-1">
                <span className="text-xs font-mono font-bold text-zinc-300">
                  Rp {Number(slot.price || 0).toLocaleString('id-ID')}
                </span>
                <button 
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 bg-zinc-950 rounded-md transition-colors border border-zinc-800 hover:border-red-500/30 cursor-pointer"
                  title="Hapus Slot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}