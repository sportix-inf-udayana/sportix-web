"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ScanBarcode,
  BarChart4,
  Grid,
  Camera,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock
} from "lucide-react";

export default function AdminScanPage() {
  const router = useRouter();
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState({ status: "READY", ticketId: "", details: null });
  const [recentScans, setRecentScans] = useState([]);

  // Integrasi Backend Nyata untuk Input Manual / Scan Barcode Mutlak
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setScanning(true);
    setScanResult({ status: "READY", ticketId: "", details: null });

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcodeToken: manualCode.trim() })
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        setScanResult({
          status: "SUCCESS",
          ticketId: manualCode.toUpperCase(),
          details: { info: data.message }
        });

        // Tambah ke log riwayat sukses
        setRecentScans(prev => [
          { ticketId: manualCode.toUpperCase(), time: new Date().toLocaleTimeString(), status: "VALID" },
          ...prev
        ].slice(0, 10)); // Simpan 10 riwayat terbaru
      } else {
        setScanResult({
          status: "FAILED",
          ticketId: manualCode.toUpperCase(),
          details: data.message || "Kode tiket tidak valid atau ditolak oleh sistem."
        });
      }
    } catch (err) {
      setScanResult({
        status: "FAILED",
        ticketId: manualCode.toUpperCase(),
        details: "Kesalahan jaringan saat menghubungi server."
      });
    } finally {
      setScanning(false);
      setManualCode("");
    }
  };

  const navigateTo = (path) => {
    router.push(path);
  };

  return (
    <div className="bg-background text-foreground min-h-screen pb-16 font-sans select-none">
      {/* Top dashboard navigation bar */}
      <div className="border-b border-zinc-800 bg-surface-elevated sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-micro font-mono text-zinc-500 block leading-none">PARTNER SUITE</span>
              <h2 className="text-base font-black text-white font-display">Live Scanner Gate</h2>
            </div>
          </div>

          <div className="flex bg-surface border border-zinc-800/80 p-1 rounded-lg">
            <button
              onClick={() => navigateTo("/admin-venue/slots")}
              className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>SLOT MATRIX</span>
            </button>
            <button
              onClick={() => navigateTo("/admin-venue/scan")}
              className="bg-surface-hover text-white px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-800 cursor-pointer"
            >
              <ScanBarcode className="w-3.5 h-3.5 text-brand-neon" />
              <span>SCANNER GATE</span>
            </button>
            <button
              onClick={() => navigateTo("/admin-venue/reports")}
              className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BarChart4 className="w-3.5 h-3.5" />
              <span>REPORTS</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white font-display">Live Ticket Scanner</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Validasi token E-Ticket UUID riil dari basis data. Pastikan jaringan internet Anda stabil.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Virtual Camera Viewfinder */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-surface border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                  <span className="text-micro font-mono uppercase text-zinc-400 tracking-wider">
                    SCANNER MODULE - AWAITING OPTICAL INPUT
                  </span>
                </div>
              </div>

              {/* Viewfinder container */}
              <div className="relative aspect-video bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-brand-neon" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-brand-neon" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-brand-neon" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-brand-neon" />

                {scanning && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-neon to-transparent shadow-[0_0_15px_var(--color-brand-neon)] animate-bounce w-full" />
                )}

                {scanning ? (
                  <div className="text-center font-mono space-y-2">
                    <RefreshCw className="w-8 h-8 text-brand-neon animate-spin mx-auto" />
                    <p className="text-xs text-zinc-400 uppercase tracking-widest">Validasi Blockchain Tiket...</p>
                  </div>
                ) : (
                  <div className="text-center p-6 text-zinc-600 font-mono text-xs space-y-3 z-10">
                    <Camera className="w-10 h-10 text-zinc-700 mx-auto" />
                    <p className="max-w-xs text-zinc-500 uppercase tracking-wide">
                      Fitur kamera optik dinonaktifkan sementara. Gunakan input manual UUID di bawah.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Validation Report & Manual Override (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Manual Fallback Entry */}
            <div className="bg-surface border border-zinc-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xs font-mono text-brand-neon uppercase tracking-wider mb-4">
                MANUAL UUID ENTRY (LIVE DATABASE)
              </h3>
              <form onSubmit={handleManualSubmit} className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="Masukkan Token UUID Tiket..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 bg-surface-elevated border border-zinc-800 focus:border-brand-neon focus:ring-1 focus:ring-brand-neon rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-700 outline-none transition-all font-mono"
                  disabled={scanning}
                />
                <button
                  type="submit"
                  disabled={scanning}
                  className="bg-brand-emerald hover:bg-emerald-400 text-black font-mono font-bold text-xs px-4 py-2 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  VALIDATE
                </button>
              </form>
            </div>

            {/* Response Report */}
            <div className="bg-surface border border-zinc-800 rounded-xl p-6 min-h-[250px]">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
                SERVER RESPONSE
              </h3>

              {scanResult.status === "SUCCESS" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-3.5 bg-brand-emerald/10 border border-brand-emerald/30 rounded-lg flex items-center gap-3 text-brand-emerald">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono">CHECK-IN APPROVED</h4>
                      <p className="text-micro text-brand-emerald/80 mt-0.5 leading-none">Status ter-update menjadi COMPLETED.</p>
                    </div>
                  </div>
                  <div className="bg-surface-elevated border border-zinc-800/80 p-4 rounded-lg font-mono text-xs space-y-3">
                    <div className="flex justify-between flex-col gap-1">
                      <span className="text-zinc-500 font-mono">SCANNED UUID</span>
                      <span className="text-brand-neon break-all font-bold">{scanResult.ticketId}</span>
                    </div>
                    <div className="border-t border-zinc-800 pt-2 text-zinc-400 text-micro">
                      {scanResult.details?.info}
                    </div>
                  </div>
                </div>
              )}

              {scanResult.status === "FAILED" && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="p-3.5 bg-red-950/30 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                    <XCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono">ACCESS DENIED</h4>
                      <p className="text-micro text-red-500/80 mt-0.5 leading-none">Validasi Ditolak oleh Server</p>
                    </div>
                  </div>
                  <div className="bg-surface-elevated border border-zinc-800/80 p-4 rounded-lg text-xs leading-relaxed text-zinc-400 font-mono break-words">
                    <span className="text-zinc-500 block mb-1.5">SERVER LOG:</span>
                    <span className="text-red-300">{scanResult.details}</span>
                  </div>
                </div>
              )}

              {scanResult.status === "READY" && (
                <div className="text-center py-12 text-zinc-600 font-mono text-xs">
                  Sistem siap. Masukkan UUID token untuk memverifikasi entri.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}