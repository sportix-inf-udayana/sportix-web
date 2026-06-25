/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'niuhnidrobsavowehzwx.supabase.co', // Ganti dengan ID Supabase Anda jika ada gambar dari Supabase Storage nanti
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;