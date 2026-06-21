import Link from "next/link";
import { 
  Activity, 
  CalendarClock, 
  Trophy, 
  Store, 
  Users, 
  ShieldAlert, 
  Zap, 
  ArrowRight,
  MapPin
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-50 selection:bg-cyan-500/30 selection:text-cyan-50">
      
      {/* HEADER / NAVIGATION BAR */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Activity className="w-6 h-6 text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all" />
            <span className="text-xl font-bold tracking-tight text-white">SPORTIX</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#ekosistem" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors">Ekosistem</a>
            <a href="#teknologi" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors">Teknologi Inti</a>
            <a href="#kemitraan" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors">Kemitraan Mitra</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Masuk
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-medium px-4 py-2 bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.4)] rounded-lg transition-all"
            >
              Pendaftaran
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center relative overflow-hidden">
        {/* Efek Neon Glow Latar Belakang */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Super-App Olahraga Tersentralisasi
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Ekosistem Olahraga <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              Digital Masa Depan
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Platform terpadu untuk mereservasi venue, merekrut pelatih bersertifikasi, dan mendukung UMKM olahraga Bali secara otonom tanpa risiko bentrok jadwal ganda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link 
              href="/login" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] group"
            >
              Reservasi Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/register" 
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 text-white font-semibold rounded-xl transition-all"
            >
              Gabung Sebagai Mitra
            </Link>
          </div>
        </div>
      </main>

      {/* MODUL EKOSISTEM SECTION */}
      <section id="ekosistem" className="border-t border-slate-800/60 bg-slate-900/50 py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Empat Pilar Utama Ekosistem</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Satu portal terpadu untuk memenuhi seluruh kebutuhan logistik dan operasional olahraga Anda di Bali.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecosystemModules.map((mod, idx) => (
              <div key={idx} className="p-8 bg-slate-950 border border-slate-800 rounded-2xl hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(8,145,178,0.15)] transition-all group">
                <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
                  {mod.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{mod.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEKNOLOGI OTONOM SECTION */}
      <section id="teknologi" className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Infrastruktur Komputasi <span className="text-cyan-400">Otonom</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Kami merancang logika backend berlapis untuk mengamankan pendapatan venue dan memberikan pengalaman penyewaan paling mulus bagi pengguna.
            </p>
            
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="shrink-0 mt-1 w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30">
                  <ShieldAlert className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Slot Locking Agent (Anti Bentrok)</h4>
                  <p className="text-sm text-slate-400">Mengunci ketersediaan slot secara eksklusif selama 15 menit ketika Anda berada di gerbang pembayaran.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="shrink-0 mt-1 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
                  <CalendarClock className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Strict Forfeit Policy</h4>
                  <p className="text-sm text-slate-400">Pelepasan otomatis sisa jam reservasi jika keterlambatan check-in melebihi toleransi 15 menit, mengeliminasi kerugian venue.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="shrink-0 mt-1 w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Digital Check-In Tanpa Antre</h4>
                  <p className="text-sm text-slate-400">Cukup tunjukkan E-Ticket Barcode ke Admin Venue. Sistem akan memvalidasi kehadiran secara seketika.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Visualisasi Abstrak Grid Slot */}
          <div className="relative w-full h-[400px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm font-bold text-slate-300">Live Grid Radar</div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-4 gap-3">
              {[...Array(16)].map((_, i) => (
                <div 
                  key={i} 
                  className={`rounded-lg border border-white/5 opacity-80 ${i === 2 || i === 7 ? 'bg-amber-500/20 border-amber-500/50 animate-pulse' : i % 5 === 0 ? 'bg-slate-800' : 'bg-emerald-500/20 border-emerald-500/30'}`}
                ></div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* FOOTER KOMPREHENSIF BERDASARKAN SRS */}
      <footer className="bg-black border-t border-slate-900 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Identitas Kampus & Proyek */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-6 h-6 text-cyan-500" />
              <span className="text-xl font-bold tracking-tight text-white">SPORTIX</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Infrastruktur perangkat lunak manajemen fasilitas olahraga multi-tenant. Mengamankan operasional transaksi melalui penegakan ketat komputasi server.
            </p>
            <div className="pt-4 flex flex-col gap-2 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-2"><MapPin className="w-3 h-3"/> Program Studi Informatika</span>
              <span>Fakultas Matematika dan Ilmu Pengetahuan Alam</span>
              <span>Universitas Udayana, Bali — 2026</span>
            </div>
          </div>

          {/* Navigasi Aktor/Mitra */}
          <div>
            <h4 className="text-white font-bold mb-4">Gerbang Akses</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Portal Penyewa (Customer)</Link></li>
              <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Dasbor Admin Venue</Link></li>
              <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Dasbor Pelatih Privat</Link></li>
              <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Dasbor Seller UMKM</Link></li>
            </ul>
          </div>

          {/* Legal & Bantuan */}
          <div>
            <h4 className="text-white font-bold mb-4">Legalitas</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Kebijakan Strict Forfeit</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Aturan Konsinyasi UMKM</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Ketentuan Denda Keterlambatan</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 text-center flex flex-col items-center justify-center">
          <p className="text-xs text-slate-600 font-mono">
            © {new Date().getFullYear()} Sportix Core System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Ekstraksi data statis agar efisien memori
const ecosystemModules = [
  {
    icon: <CalendarClock />,
    title: "Reservasi & Peminjaman",
    desc: "Sewa lapangan real-time sekaligus menambahkan pinjaman peralatan fisik pendukung dalam satu keranjang."
  },
  {
    icon: <Users />,
    title: "Pelatih Bersertifikasi",
    desc: "Eksplorasi pelatih lokal yang terverifikasi. Tentukan jadwal dan bayar jasa bimbingan privat secara otomatis."
  },
  {
    icon: <Trophy />,
    title: "Turnamen Regional",
    desc: "Pusat pendaftaran roster kompetisi lokal Bali. Susun tim Anda dan pantau jadwal perlombaan resmi."
  },
  {
    icon: <Store />,
    title: "UMKM Konsinyasi",
    desc: "Dukung perekonomian lokal. Beli perlengkapan olahraga buatan Bali yang dititipkan pada pro-shop lapangan."
  }
];