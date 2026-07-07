"use client";

import React, { useState } from "react";
import QrScanner from "react-qr-barcode-scanner";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, ScanBarcode, CheckCircle, AlertOctagon, Camera } from "lucide-react";

export default function ScannerClient() {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [useCamera, setUseCamera] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const processToken = async (token) => {
    if (!token.trim()) return;
    setLoading(true); setScanResult(null); setScanError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("Otorisasi hilang. Harap log in kembali.");

      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({ barcodeToken: token.trim() })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gagal memproses verifikasi.");

      setScanResult(result.message);
      setBarcodeInput("");
      setUseCamera(false); // Matikan kamera jika sukses
    } catch (err) {
      setScanError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraScan = (err, result) => {
    if (result && !loading && !scanResult) {
      processToken(result.text);
    }
  };

  return (
    <div className="max-w-md mx-auto font-sans text-white space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <ScanBarcode className="w-5 h-5 text-brand-emerald" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider">Gate Check-In</h3>
          </div>
          <button onClick={() => setUseCamera(!useCamera)} className="text-zinc-400 hover:text-white p-1">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {useCamera ? (
          <div className="aspect-square bg-black rounded-lg overflow-hidden border-2 border-dashed border-zinc-700 relative flex items-center justify-center mb-4">
            <QrScanner onUpdate={handleCameraScan} width="100%" height="100%" />
            <div className="absolute inset-0 bg-brand-emerald/10 animate-pulse pointer-events-none" />
          </div>
        ) : null}

        <form onSubmit={(e) => { e.preventDefault(); processToken(barcodeInput); }} className="space-y-4">
          <div className="space-y-2">
            <label className="text-micro font-mono text-zinc-500 uppercase tracking-widest block">Input Manual (Fallback)</label>
            <input
              type="text"
              disabled={loading}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Masukkan token karcis"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-brand-emerald"
            />
          </div>
          <button type="submit" disabled={loading || (!barcodeInput.trim() && !useCamera)} className="w-full bg-brand-emerald hover:bg-brand-emerald/90 text-black disabled:bg-zinc-800 disabled:text-zinc-600 font-mono text-xs font-bold py-3.5 rounded-lg flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>MEMVALIDASI...</span></> : <span>VERIFIKASI TIKET</span>}
          </button>
        </form>
      </div>

      {scanResult && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-brand-neon shrink-0 mt-0.5" />
          <div className="text-xs font-mono">
            <p className="text-brand-neon font-bold uppercase tracking-wider">TICKET_VALIDATED</p>
            <p className="text-zinc-400 mt-1">{scanResult}</p>
          </div>
        </div>
      )}

      {scanError && (
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono">
            <p className="text-red-400 font-bold uppercase tracking-wider">VALIDATION_DENIED</p>
            <p className="text-zinc-400 mt-1">{scanError}</p>
          </div>
        </div>
      )}
    </div>
  );
}