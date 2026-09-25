/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    /**
     * Image pipeline policy: repo photos and sharp-processed uploads are served
     * with plain <img> tags (already compressed in-repo / at upload time), so
     * they never generate billable /_next/image transformations. Only remote
     * Vercel Blob URLs (legacy uploads that pre-date the sharp pipeline, some
     * >300 KB) are rendered through next/image, where they are resized and
     * re-encoded to AVIF/WebP on the fly. remotePatterns below is locked to the
     * Blob host so nothing else can ever reach the optimizer.
     */
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

      /*
       * Indexing cleanup (Search Console "Not found (404)" + duplicate rows).
       * These paths never existed as routes but are cheaply guessable or were
       * probed by crawlers; each now resolves to its real home with a 301 so
       * link equity consolidates instead of 404ing. Exact-match only — the
       * /products, /products/:slug and /ar/products/:slug pages are real routes.
       */
      { source: '/custom-labels-uk', destination: '/custom-clothing-labels-uk', permanent: true },
      { source: '/custom-labels-usa', destination: '/custom-clothing-labels-usa', permanent: true },
      { source: '/home', destination: '/', permanent: true },
      { source: '/index', destination: '/', permanent: true },
      { source: '/index.html', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
