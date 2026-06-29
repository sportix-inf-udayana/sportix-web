import React from "react";
import Link from "next/link";

export default function CustomerFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-800 pt-12 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Kolom 1: Brand & Visi */}
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="font-mono font-black text-2xl tracking-wider text-white inline-block mb-4">
            SPORTIX<span className="text-brand-emerald">.</span>
          </Link>
          <p className="text-sm text-brand-slate max-w-sm leading-relaxed">
            Sistem reservasi lapangan olahraga otonom dan cashless terdepan. Menggabungkan teknologi ledger real-time dengan pengalaman pengguna tanpa hambatan.
          </p>
        </div>

        {/* Kolom 2: Navigasi Cepat */}
        <div>
          <h4 className="text-white font-semibold mb-4 tracking-tight">Eksplorasi</h4>
          <ul className="space-y-2 text-sm text-brand-slate font-medium">
            <li><Link href="/" className="hover:text-brand-emerald transition-colors">Katalog Arena</Link></li>
            <li><Link href="/umkm" className="hover:text-brand-emerald transition-colors">Toko Merchandise</Link></li>
            <li><Link href="/tournaments" className="hover:text-brand-emerald transition-colors">Papan Turnamen</Link></li>
          </ul>
        </div>

        {/* Kolom 3: Legalitas & Bantuan */}
        <div>
          <h4 className="text-white font-semibold mb-4 tracking-tight">Dukungan</h4>
          <ul className="space-y-2 text-sm text-brand-slate font-medium">
            <li><Link href="/faq" className="hover:text-brand-emerald transition-colors">Pusat Bantuan (FAQ)</Link></li>
            <li><Link href="/terms" className="hover:text-brand-emerald transition-colors">Syarat & Ketentuan</Link></li>
            <li><Link href="/privacy" className="hover:text-brand-emerald transition-colors">Kebijakan Privasi</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs font-mono text-brand-slate">
          &copy; {currentYear} SPORTIX SYSTEM. ALL RIGHTS RESERVED.
        </p>
        <p className="text-xs font-mono text-zinc-600">
          SECURE ENCRYPTED TRANSACTIONS
        </p>
      </div>
    </footer>
  );
}