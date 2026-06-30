"use client";

import React, { useState, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, ScanBarcode, CheckCircle, AlertOctagon } from "lucide-react";

export default function ScannerClient() {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), []);

  const handleScanExecution = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    setLoading(true);
    setScanResult(null);
    setScanError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Otorisasi hilang. Harap muat ulang halaman dan log in kembali.");
      }

      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ barcodeToken: barcodeInput.trim() })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memproses verifikasi check-in tiket.");
      }

      setScanResult(result.message);
      setBarcodeInput("");

    } catch (err) {
      console.error(err);
      setScanError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto font-sans text-white space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
          <ScanBarcode className="w-5 h-5 text-brand-emerald" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider">Gate Check-In Validator</h3>
        </div>

        <form onSubmit={handleScanExecution} className="space-y-4">
          <div className="space-y-2">
            <label className="text-micro font-mono text-zinc-500 uppercase tracking-widest block">Input Barcode Token</label>
            <input
              type="text"
              required
              disabled={loading}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Masukkan atau tempel token karcis atlet"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-brand-emerald transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !barcodeInput.trim()}
            className="w-full bg-brand-emerald hover:bg-brand-emerald/90 disabled:bg-zinc-800 text-black disabled:text-zinc-600 font-mono text-xs font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>MEMVALIDASI TIKET...</span>
              </>
            ) : (
              <span>VERIFIKASI KEDATANGAN</span>
            )}
          </button>
        </form>
      </div>

      {/* Tampilan Konfirmasi Hasil Pemindaian */}
      {scanResult && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-start gap-3 shadow-inner">
          <CheckCircle className="w-5 h-5 text-brand-neon shrink-0 mt-0.5" />
          <div className="text-xs font-mono">
            <p className="text-brand-neon font-bold uppercase tracking-wider">TICKET_VALIDATED_SUCCESS</p>
            <p className="text-zinc-400 mt-1 leading-relaxed">{scanResult}</p>
          </div>
        </div>
      )}

      {scanError && (
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-3 shadow-inner">
          <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono">
            <p className="text-red-400 font-bold uppercase tracking-wider">VALIDATION_DENIED_CRITICAL</p>
            <p className="text-zinc-400 mt-1 leading-relaxed">{scanError}</p>
          </div>
        </div>
      )}
    </div>
  );
}