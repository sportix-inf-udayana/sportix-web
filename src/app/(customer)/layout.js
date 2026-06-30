import React from "react";
import CustomerHeader from "../../components/customer/CustomerHeader";
import CustomerFooter from "../../components/customer/CustomerFooter";

export const dynamic = 'force-dynamic';

export default async function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      
      {/* Navigasi Global Terpadu (Menangani Otomatisasi Deteksi Lintas Portal Pelanggan & Mitra) */}
      <CustomerHeader />
      
      {/* Area Rute Render Konten Bisnis */}
      <main className="flex-1">
        {children}
      </main>

      {/* Komponen Kaki Halaman Umum */}
      <CustomerFooter />
      
    </div>
  );
}