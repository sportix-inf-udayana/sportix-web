/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // WAJIB untuk mendeteksi anomali React di tahap development
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'your-supabase-project-id.supabase.co', // Siapkan untuk gambar asli di masa depan
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },
  // Mengabaikan error ESLint sementara saat build jika Anda belum merapikan rules-nya
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;