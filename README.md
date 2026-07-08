# Sportix Web System

Sistem reservasi lapangan olahraga otonom dan terdesentralisasi. Dibangun dengan fokus pada presisi transaksi, manajemen *multi-tenant*, dan penegakan *Service Level Agreement* (SLA) secara ketat.

## 🚀 Teknologi Inti

- **Framework:** Next.js 14 (App Router)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, SSR Auth)
- **Styling:** Tailwind CSS + PostCSS
- **Payment Gateway:** Midtrans Snap (Cashless Protocol)
- **Deployment:** Vercel (Edge Functions & Cron Jobs)

## 🔐 Arsitektur Keamanan & Fitur

1. **Otorisasi Granular (RBAC):** Pemisahan entitas menjadi 5 lapis (Super Admin, Admin Venue, Coach, UMKM Seller, Customer).
2. **Autonomous Slot Locking:** Penanganan *double-booking* melalui penguncian status slot tingkat basis data secara otomatis saat *checkout*.
3. **Strict No-Show Policy:** *Cron job* mengevaluasi keterlambatan secara otomatis. Tiket hangus mutlak jika melebihi toleransi waktu.
4. **Encrypted Validation:** Karcis menggunakan UUID yang dienkripsi dan dipindai secara langsung oleh operator gerbang.
