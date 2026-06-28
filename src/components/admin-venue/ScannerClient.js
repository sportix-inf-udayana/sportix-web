"use client";

import React, { useState } from "react";
import { QrReader } from "react-qr-reader"; // Asumsi penggunaan library ini
import { Camera, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

export default function ScannerClient() {
  const [data, setData] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [status, setStatus] = useState("IDLE"); // IDLE, SCANNING, SUCCESS, ERROR

  const handleScan = async (result) => {
    if (result && status !== "SUCCESS") {
      setStatus("SCANNING");
      try {
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ barcodeToken: result.text }),
        });
        
        const data = await response.json();
        if (data.success) {
          setData(data.reservation);
          setStatus("SUCCESS");
        } else {
          setStatus("ERROR");
        }
      } catch (err) {
        setStatus("ERROR");
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-surface border border-brand-slate/20 rounded-xl p-6">
        <h3 className="text-xs font-mono text-brand-slate uppercase tracking-wider mb-6">
          E-TICKET VERIFICATION GATE
        </h3>

        {status === "SUCCESS" ? (
          <div className="text-center py-8 space-y-4 animate-in fade-in">
            <CheckCircle className="w-16 h-16 text-brand-emerald mx-auto" />
            <h4 className="text-lg font-bold text-white">Check-In Terverifikasi</h4>
            <p className="text-brand-slate text-sm">Tiket {data?.id} valid. Status diperbarui ke CHECKED_IN.</p>
            <button 
              onClick={() => { setStatus("IDLE"); setData(null); }}
              className="mt-4 px-4 py-2 bg-brand-slate/10 text-white rounded text-sm hover:bg-brand-slate/20"
            >
              Scan Tiket Baru
            </button>
          </div>
        ) : (
          <div className="relative aspect-square bg-surface-elevated rounded-lg overflow-hidden border border-brand-slate/20">
            <QrReader
              onResult={handleScan}
              constraints={{ facingMode: "environment" }}
              className="w-full h-full"
            />
            {status === "SCANNING" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-brand-neon animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      {status === "ERROR" && (
        <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-400">Verifikasi gagal. Tiket tidak ditemukan atau sudah kadaluarsa.</p>
        </div>
      )}
    </div>
  );
}