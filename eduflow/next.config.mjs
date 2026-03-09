/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      '@supabase/supabase-js',
      'lucide-react',
      'recharts',
      'framer-motion',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hwwsbwvvlkqqwbjemwhz.supabase.co',
      },
    ],
  },
};

export default nextConfig;
