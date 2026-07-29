/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1600],
    imageSizes: [32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Product/artwork images uploaded to Vercel Blob are served from this host.
    // Without this entry next/image throws on every uploaded image.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
};

export default nextConfig;
