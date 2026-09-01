/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    /**
     * Vercel Image Optimization is intentionally unused now: every image on
     * the site is either (a) an admin upload that was already resized and
     * re-encoded to WebP by sharp at upload time, or (b) a repo photo that was
     * batch-compressed before commit. Both are served with plain <img> tags,
     * so no billable /_next/image transformations are ever generated.
     * Keeping unoptimized: true makes that guarantee hard to undo by accident.
     */
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1600],
    imageSizes: [32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
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
  /**
   * Short memorable aliases for the geo landing pages.
   * 301 (permanent) so search engines consolidate ranking onto the real URL.
   */
  async redirects() {
    return [
      { source: '/uk', destination: '/custom-clothing-labels-uk', permanent: true },
      { source: '/usa', destination: '/custom-clothing-labels-usa', permanent: true },
      { source: '/us', destination: '/custom-clothing-labels-usa', permanent: true },
      { source: '/uae', destination: '/custom-labels-uae', permanent: true },
      { source: '/dubai', destination: '/custom-labels-uae', permanent: true },
      { source: '/saudi', destination: '/custom-labels-saudi-arabia', permanent: true },
      { source: '/saudi-arabia', destination: '/custom-labels-saudi-arabia', permanent: true },
      { source: '/ksa', destination: '/custom-labels-saudi-arabia', permanent: true },
      { source: '/qatar', destination: '/custom-labels-qatar', permanent: true },
      { source: '/doha', destination: '/custom-labels-qatar', permanent: true },
      { source: '/kuwait', destination: '/custom-labels-kuwait', permanent: true },
      { source: '/arabic', destination: '/ar', permanent: true },
    ];
  },
};

export default nextConfig;
