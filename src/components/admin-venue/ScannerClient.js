"use client";

import React, { useState, useRef, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { CheckCircle2, AlertTriangle, Loader2, RefreshCcw, Camera } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

// TERIMA accessToken SEBAGAI PROP
export default function ScannerClient({ accessToken }) {
  const [isMounted, setIsMounted] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("IDLE");
  const lastScannedRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleProcessBarcode = async (token) => {
    if (lastScannedRef.current === token || isScanning) return;
    if (!accessToken) {
      setScanStatus("ERROR");
      setScanResult({ message: "Token akses tidak tersedia. Muat ulang halaman." });
      return;
    }
    
    lastScannedRef.current = token;
    setIsScanning(true);
    setScanStatus("IDLE");
    
    try {
      // API call langsung tanpa perlu auth.getSession() lagi
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ barcodeToken: token })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Token Tidak Valid.");

      setScanStatus("SUCCESS");
      setScanResult({
        name: data.userName,
        field: data.fieldName,
        message: data.message
      });
    } catch (err) {
      setScanStatus("ERROR");
      setScanResult({ message: err.message });
    } finally {
      setIsScanning(false);
      setTimeout(() => { lastScannedRef.current = null; }, 3000);
    }
  };

  if (!isMounted) {
    return (
      <div className="w-full aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500 shadow-2xl">
        <Camera className="w-8 h-8 mb-2 opacity-50" />
        <span className="font-mono text-xs tracking-wider uppercase">MEMUAT MODUL KAMERA...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-2xl overflow-hidden relative shadow-2xl">
        <div className="rounded-xl overflow-hidden aspect-square relative bg-zinc-950 flex items-center justify-center">
          
          <BarcodeScannerComponent
            width="100%"
            height="100%"
            onUpdate={(err, result) => {
              if (result) handleProcessBarcode(result.text);
            }}
          />

          <div className="absolute inset-0 border-4 border-brand-emerald/30 z-10 pointer-events-none rounded-xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/50 border-dashed z-10 rounded-xl" />

          {isScanning && (
            <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center text-brand-emerald backdrop-blur-sm">
              <Loader2 className="w-10 h-10 animate-spin mb-2" />
              <span className="font-mono text-xs font-bold tracking-widest uppercase">MEMVALIDASI TOKEN...</span>
            </div>
          )}
        </div>
      </div>

      {scanStatus !== "IDLE" && (
        <div className={cn(
          "p-5 rounded-xl border flex flex-col gap-2 items-center text-center animate-in fade-in zoom-in duration-200",
          scanStatus === "SUCCESS" ? "bg-emerald-950/20 border-brand-emerald/30" : "bg-red-950/20 border-red-500/30"
        )}>
          {scanStatus === "SUCCESS" ? (
            <>
              <CheckCircle2 className="w-10 h-10 text-brand-emerald mb-1" />
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Akses Diizinkan</h3>
              <div className="text-xs text-zinc-400">
                <p>Atlet: <strong className="text-white">{scanResult?.name}</strong></p>
                <p>Arena: <strong className="text-white">{scanResult?.field}</strong></p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-10 h-10 text-red-500 mb-1" />
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Akses Ditolak</h3>
              <p className="text-xs text-red-400 font-mono">{scanResult?.message}</p>
            </>
          )}
        </div>
      )}

      <button 
        onClick={() => { setScanStatus("IDLE"); setScanResult(null); lastScannedRef.current = null; }}
        className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 border border-zinc-800 transition-all cursor-pointer shadow-md"
      >
        <RefreshCcw className="w-4 h-4" />
        <span>RESET SCANNER</span>
      </button>
    </div>
  );
}