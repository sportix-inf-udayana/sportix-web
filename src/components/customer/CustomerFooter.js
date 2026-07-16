// src/components/customer/CustomerFooter.js
import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function CustomerFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-900 pt-16 pb-8 mt-auto font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-brand-emerald/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 relative z-10">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="font-display font-black text-2xl tracking-tighter text-white inline-block mb-4 hover:opacity-90 transition-opacity">
            SPORTIX<span className="text-brand-emerald">.</span>
          </Link>
          <p className="text-xs text-zinc-500 max-w-sm leading-relaxed font-mono">
            Sistem reservasi lapangan olahraga otonom dan cashless terdepan. Menggabungkan teknologi ledger real-time dengan pengalaman pengguna tanpa hambatan.
          </p>
          <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 w-max">
            <ShieldCheck className="w-4 h-4 text-brand-emerald" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">100% Secure Gateway</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-5 tracking-widest uppercase text-[10px] font-mono">Eksplorasi</h4>
          <ul className="space-y-3 text-xs text-zinc-400 font-mono uppercase tracking-wider">
            <li><Link href="/" className="hover:text-brand-emerald transition-colors">Katalog Arena</Link></li>
            <li><Link href="/umkm" className="hover:text-brand-emerald transition-colors">Sports Store</Link></li>
            <li><Link href="/tournaments" className="hover:text-brand-emerald transition-colors">Papan Turnamen</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-5 tracking-widest uppercase text-[10px] font-mono">Dukungan</h4>
          <ul className="space-y-3 text-xs text-zinc-400 font-mono uppercase tracking-wider">
            <li><Link href="#" className="hover:text-brand-emerald transition-colors">Pusat Bantuan</Link></li>
            <li><Link href="#" className="hover:text-brand-emerald transition-colors">Syarat & Ketentuan</Link></li>
            <li><Link href="#" className="hover:text-brand-emerald transition-colors">Kebijakan Privasi</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        <p className="text-[10px] font-mono font-bold tracking-widest text-zinc-600 uppercase">
          &copy; {currentYear} SPORTIX SYSTEM. ALL RIGHTS RESERVED.
        </p>
        <p className="text-[10px] font-mono font-bold tracking-widest text-zinc-600 uppercase">
          DECENTRALIZED SPORTS ECOSYSTEM
        </p>
      </div>
    </footer>
  );
}