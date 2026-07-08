/** @type {import('next').NextConfig} */

const getSupabaseHostname = () => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return "*.supabase.co";
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  } catch (error) {
    console.warn("Peringatan Sistem: URL Supabase tidak valid, menggunakan domain fallback.");
    return "*.supabase.co";
  }
};

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: getSupabaseHostname(),
        port: "",
        pathname: "/storage/v1/object/public/**",
      }
    ]
  }
};

export default nextConfig;