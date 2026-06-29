"use client";

import React, { useState, useRef, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, AlertTriangle, RefreshCw, QrCode, Keyboard, Camera } from "lucide-react";

export default function ScannerClient() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("IDLE"); // IDLE, SCANNING, SUCCESS, ERROR
  const [manualToken, setManualToken] = useState("");
  const [useCamera, setUseCamera] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus ke input jika mode manual/hardware scanner aktif
  useEffect(() => {
    if (status === "IDLE" && !useCamera && inputRef.current) {
      inputRef.current.focus();
    }
  }, [status, useCamera]);

  // Inisialisasi Kamera Scanner
  useEffect(() => {
    let scanner = null;
    if (useCamera && status === "IDLE") {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      scanner.render(
        (decodedText) => {
          scanner.clear();
          processToken(decodedText);
        },
        (error) => {
          // Abaikan error frame kosong agar konsol tidak spam
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((error) => console.error("Failed to clear scanner", error));
      }
    };
  }, [useCamera, status]);

  const processToken = async (tokenStr) => {
    if (!tokenStr.trim()) return;
    
    setStatus("SCANNING");
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcodeToken: tokenStr }),
      });
      
      const resData = await response.json();
      if (resData.success) {
        setData(resData.reservation);
        setStatus("SUCCESS");
      } else {
        setStatus("ERROR");
      }
    } catch (err) {
      setStatus("ERROR");
    } finally {
      setManualToken("");
      setUseCamera(false); // Matikan kamera jika sudah dapat hasil
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    processToken(manualToken);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-surface border border-brand-slate/20 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6 border-b border-brand-slate/20 pb-4">
          <h3 className="text-xs font-mono text-brand-slate uppercase tracking-wider flex items-center gap-2">
            <QrCode className="w-4 h-4 text-brand-neon" /> E-TICKET VERIFICATION GATE
          </h3>
          <span className="text-micro bg-brand-slate/10 px-2 py-1 rounded text-brand-slate font-mono animate-pulse">
            SYSTEM READY
          </span>
        </div>

        {status === "SUCCESS" ? (
          <div className="text-center py-10 space-y-4 animate-in zoom-in duration-300">
            <CheckCircle className="w-20 h-20 text-brand-emerald mx-auto drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <h4 className="text-xl font-black text-white font-display">Check-In Terverifikasi</h4>
            <div className="bg-surface-elevated border border-brand-emerald/20 p-4 rounded-lg inline-block w-full max-w-sm mt-2">
              <p className="text-brand-slate text-xs font-mono mb-1">RESERVATION ID</p>
              <p className="text-brand-neon font-bold font-mono text-sm break-all">{data?.id || "N/A"}</p>
            </div>
            <button 
              onClick={() => { setStatus("IDLE"); setData(null); }}
              className="mt-6 w-full py-3 bg-brand-emerald text-black font-black uppercase font-mono rounded-lg hover:bg-brand-emerald/90 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              SCAN TIKET BERIKUTNYA
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {status === "ERROR" && (
              <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-bold text-red-400">Verifikasi Ditolak</h5>
                  <p className="text-xs text-red-400/80 mt-1">Tiket tidak valid, bukan milik arena ini, atau sudah berstatus kedaluwarsa/hangus.</p>
                </div>
              </div>
            )}

            <div className="flex bg-surface-elevated border border-brand-slate/20 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setUseCamera(false)}
                className={`flex-1 py-2 text-xs font-bold font-mono rounded-md flex items-center justify-center gap-2 transition-colors ${!useCamera ? 'bg-surface border border-brand-slate/20 text-white shadow-sm' : 'text-brand-slate hover:text-white'}`}
              >
                <Keyboard className="w-4 h-4" /> FISIK / MANUAL
              </button>
              <button
                type="button"
                onClick={() => setUseCamera(true)}
                className={`flex-1 py-2 text-xs font-bold font-mono rounded-md flex items-center justify-center gap-2 transition-colors ${useCamera ? 'bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald shadow-sm' : 'text-brand-slate hover:text-white'}`}
              >
                <Camera className="w-4 h-4" /> KAMERA PERANGKAT
              </button>
            </div>

            <div className={`relative bg-surface-elevated border-2 border-dashed rounded-xl p-6 transition-colors ${status === "SCANNING" ? "border-brand-neon bg-brand-neon/5" : "border-brand-slate/30"}`}>
              {status === "SCANNING" ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <RefreshCw className="w-10 h-10 text-brand-neon animate-spin mb-4" />
                  <p className="text-sm font-mono text-brand-neon animate-pulse">MENCOCOKKAN BUKU BESAR...</p>
                </div>
              ) : useCamera ? (
                <div className="overflow-hidden rounded-lg">
                  <div id="qr-reader" className="w-full text-white [&_video]:w-full [&_video]:rounded-lg [&_video]:object-cover"></div>
                  <p className="text-xs text-brand-slate text-center mt-4">Arahkan QR Code ke kamera.</p>
                </div>
              ) : (
                <form onSubmit={handleManualSubmit} className="space-y-4 text-center py-4">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-surface border border-brand-slate/20 rounded-full flex items-center justify-center">
                      <Keyboard className="w-8 h-8 text-brand-slate" />
                    </div>
                  </div>
                  <h4 className="text-white font-bold text-sm">Gunakan Scanner USB atau Ketik Manual</h4>
                  <div className="pt-2">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Contoh: 550e8400-e29b-41d4..."
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      className="w-full bg-surface border border-brand-slate/30 focus:border-brand-neon rounded-lg px-4 py-3 text-center text-sm text-white font-mono outline-none transition-all"
                      disabled={status === "SCANNING"}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!manualToken.trim() || status === "SCANNING"}
                    className="w-full bg-surface-hover hover:bg-brand-slate/20 border border-brand-slate/20 text-white font-bold py-3 rounded-lg text-xs tracking-wider uppercase transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    VERIFIKASI MANUAL
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}