"use client";

import React, { useState } from "react";
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
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState({
    status: "READY",
    ticketId: "",
    details: null
  });

  const [recentScans, setRecentScans] = useState([
    { ticketId: "INV-8828", name: "Wayan Gede", time: "09:58 AM", status: "VALID" },
    { ticketId: "INV-8825", name: "Ketut Adi", time: "09:42 AM", status: "VALID" },
    { ticketId: "INV-8820", name: "Budi Santoso", time: "08:03 AM", status: "VALID" }
  ]);

  const handleSimulateScan = (type) => {
    setScanning(true);
    setScanResult({ status: "READY", ticketId: "", details: null });

    setTimeout(() => {
      setScanning(false);
      if (type === "valid") {
        const result = {
          status: "SUCCESS",
          ticketId: "INV-8829",
          details: {
            athlete: "Made Sukarta",
            venue: "Academy Stadium (Indoor Turf)",
            slot: "WE 24 Oct, 10:00 - 11:00",
            gate: "Self-Scan Gate A, Row G, Seat 12"
          }
        };
        setScanResult(result);

        if (!recentScans.some(s => s.ticketId === "INV-8829")) {
          setRecentScans([
            { ticketId: "INV-8829", name: "Made Sukarta", time: "10:01 AM", status: "VALID" },
            ...recentScans
          ]);
        }
      } else {
        setScanResult({
          status: "FAILED",
          ticketId: "INV-9999",
          details: "Keterlambatan &gt;15 menit menghanguskan tiket. Kode QR kedaluwarsa atau tidak valid."
        });
      }
    }, 1500);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode) return;

    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      if (manualCode.toUpperCase() === "INV-8829") {
        setScanResult({
          status: "SUCCESS",
          ticketId: "INV-8829",
          details: {
            athlete: "Made Sukarta",
            venue: "Academy Stadium",
            slot: "WE 24 Oct, 10:00 - 11:00",
            gate: "Gate A, Row G, Seat 12"
          }
        });
      } else {
        setScanResult({
          status: "FAILED",
          ticketId: manualCode.toUpperCase(),
          details: "Kode tiket tidak terdaftar pada ledger atau melanggar ambang batas 15-menit."
        });
      }
      setManualCode("");
    }, 1000);
  };

  const navigateTo = (path) => {
    window.location.hash = path;
    if (window.__sportixNavigate) {
      window.__sportixNavigate(path);
    }
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
              <h2 className="text-base font-black text-white font-display">Academy Stadium Partner Suite</h2>
            </div>
          </div>

          <div className="flex bg-surface border border-zinc-800/80 p-1 rounded-lg">
            <button
              onClick={() => navigateTo("/admin-venue/slots")}
              className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>SLOT MATRIX</span>
            </button>
            <button
              onClick={() => navigateTo("/admin-venue/scan")}
              className="bg-surface-hover text-white px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 border border-zinc-800"
            >
              <ScanBarcode className="w-3.5 h-3.5 text-brand-neon" />
              <span>SCANNER GATE</span>
            </button>
            <button
              onClick={() => navigateTo("/admin-venue/reports")}
              className="text-zinc-500 hover:text-zinc-300 px-4 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
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
            Sistem validasi QR/Barcode e-ticket secara real-time. Hubungkan gerbang pemindaian mandiri dan lacak kehadiran atlet secara instan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Visual Camera Viewfinder Simulator (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-surface border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                  <span className="text-micro font-mono uppercase text-zinc-400 tracking-wider">
                    SCANNER MODULE A - CAMERA LIVE
                  </span>
                </div>
                <div className="text-micro font-mono text-brand-neon">
                  1080P • 60 FPS
                </div>
              </div>

              {/* Viewfinder container */}
              <div className="relative aspect-video bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-brand-neon" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-brand-neon" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-brand-neon" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-brand-neon" />

                {/* Laser scan lines */}
                {scanning && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-neon to-transparent shadow-[0_0_15px_var(--color-brand-neon)] animate-bounce w-full" />
                )}

                {/* Simulator UI inside viewport */}
                {scanning ? (
                  <div className="text-center font-mono space-y-2">
                    <RefreshCw className="w-8 h-8 text-brand-neon animate-spin mx-auto" />
                    <p className="text-xs text-zinc-400 uppercase tracking-widest">Memproses Tiket...</p>
                  </div>
                ) : (
                  <div className="text-center p-6 text-zinc-600 font-mono text-xs space-y-3 z-10">
                    <Camera className="w-10 h-10 text-zinc-700 mx-auto" />
                    <p className="max-w-xs text-zinc-500 uppercase tracking-wide">
                      Posisikan barcode atlet di dalam zona pemindaian
                    </p>
                  </div>
                )}
              </div>

              {/* Simulation triggers */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSimulateScan("valid")}
                  className="bg-brand-emerald/20 hover:bg-brand-emerald/30 border border-brand-emerald/30 text-brand-emerald hover:text-white font-mono font-bold text-xs py-2.5 rounded transition-all"
                >
                  SIMULATE TICKET INV-8829
                </button>
                <button
                  onClick={() => handleSimulateScan("invalid")}
                  className="bg-red-900/30 hover:bg-red-900 border border-red-500/20 hover:border-transparent text-red-400 hover:text-white font-mono font-bold text-xs py-2.5 rounded transition-all"
                >
                  SIMULATE LATE TICKET
                </button>
              </div>
            </div>
          </div>

          {/* Validation Report & Logs (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
                VALIDATION REPORT
              </h3>

              {scanResult.status === "SUCCESS" && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-brand-emerald/10 border border-brand-emerald/30 rounded-lg flex items-center gap-3 text-brand-emerald">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono">TICKET VALIDATED</h4>
                      <p className="text-micro text-brand-emerald/80 mt-0.5 leading-none">Gate A Check-In Permitted</p>
                    </div>
                  </div>

                  <div className="bg-surface-elevated border border-zinc-800/80 p-4 rounded-lg font-mono text-xs space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-mono">TICKET ID</span>
                      <span className="text-brand-neon font-bold">{scanResult.ticketId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">ATHLETE</span>
                      <span className="text-white">{scanResult.details?.athlete}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">SESSION SLOT</span>
                      <span className="text-white">{scanResult.details?.slot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">GATE/ROW</span>
                      <span className="text-brand-neon">{scanResult.details?.gate}</span>
                    </div>
                  </div>
                </div>
              )}

              {scanResult.status === "FAILED" && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-red-950/30 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                    <XCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono">ACCESS DENIED</h4>
                      <p className="text-micro text-red-500/80 mt-0.5 leading-none">Forfeited / Invalid Pass</p>
                    </div>
                  </div>

                  <div className="bg-surface-elevated border border-zinc-800/80 p-4 rounded-lg text-xs leading-relaxed text-zinc-400">
                    <span className="text-zinc-500 font-mono uppercase block mb-1.5">ERROR LOG DESCRIPTION</span>
                    {scanResult.details}
                  </div>
                </div>
              )}

              {scanResult.status === "READY" && (
                <div className="text-center py-12 text-zinc-600 font-mono text-xs">
                  Scan ticket menggunakan simulator di sebelah kiri untuk melihat laporan validitas langsung.
                </div>
              )}
            </div>

            {/* Manual Override Fallback */}
            <div className="bg-surface border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
                MANUAL CODE FALLBACK ENTRY
              </h3>
              <form onSubmit={handleManualSubmit} className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="e.g., INV-8829"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 bg-surface-elevated border border-zinc-800 focus:border-brand-neon rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-700 outline-none transition-all uppercase font-mono"
                />
                <button
                  type="submit"
                  className="bg-zinc-800 hover:bg-brand-neon hover:text-background border border-zinc-700 text-zinc-300 font-mono font-bold text-xs px-4 py-2 rounded-lg transition-all"
                >
                  VALIDATE
                </button>
              </form>
            </div>

            {/* Log Stream */}
            <div className="bg-surface border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> RECENT SUCCESSFUL SCANS
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {recentScans.map((log, i) => (
                  <div key={i} className="flex justify-between items-center bg-surface-elevated border border-zinc-900 p-2.5 rounded">
                    <div>
                      <span className="text-white font-bold">{log.ticketId}</span>
                      <span className="text-zinc-500 text-micro ml-2 font-sans">{log.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-brand-neon text-micro block font-bold">{log.status}</span>
                      <span className="text-zinc-600 text-[9px] block mt-0.5">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}