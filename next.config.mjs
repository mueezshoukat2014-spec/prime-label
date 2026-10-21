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
      { source: '/uk', destination: '/', permanent: true },
      { source: '/usa', destination: '/', permanent: true },
      { source: '/us', destination: '/', permanent: true },
      { source: '/uae', destination: '/', permanent: true },
      { source: '/dubai', destination: '/', permanent: true },
      { source: '/saudi', destination: '/', permanent: true },
      { source: '/saudi-arabia', destination: '/', permanent: true },
      { source: '/ksa', destination: '/', permanent: true },
      { source: '/qatar', destination: '/', permanent: true },
      { source: '/doha', destination: '/', permanent: true },
      { source: '/kuwait', destination: '/', permanent: true },
      { source: '/arabic', destination: '/ar', permanent: true },

      /*
       * Indexing cleanup (Search Console "Not found (404)" + duplicate rows).
       * These paths never existed as routes but are cheaply guessable or were
       * probed by crawlers; each now resolves to its real home with a 301 so
       * link equity consolidates instead of 404ing. Exact-match only — the
       * /products, /products/:slug and /ar/products/:slug pages are real routes.
       */
      { source: '/custom-labels-uk', destination: '/', permanent: true },
      { source: '/custom-labels-usa', destination: '/', permanent: true },
      /*
       * Site minimised (Oct 2026): country landing pages, the GCC page and the
       * guides were retired. Each old URL 301s to the closest live page so
       * rankings and old links carry over (specific rules before the catch-all).
       */
      { source: '/custom-labels-saudi-arabia', destination: '/', permanent: true },
      { source: '/custom-labels-uae', destination: '/', permanent: true },
      { source: '/custom-labels-qatar', destination: '/', permanent: true },
      { source: '/custom-labels-kuwait', destination: '/', permanent: true },
      { source: '/custom-clothing-labels-uk', destination: '/', permanent: true },
      { source: '/custom-clothing-labels-usa', destination: '/', permanent: true },
      { source: '/custom-clothing-labels-pakistan', destination: '/', permanent: true },
      { source: '/custom-clothing-labels-canada', destination: '/', permanent: true },
      { source: '/custom-clothing-labels-australia', destination: '/', permanent: true },
      { source: '/gcc-custom-labels', destination: '/', permanent: true },
      { source: '/guides/label-folds-sizes', destination: '/products/woven-labels', permanent: true },
      { source: '/guides/woven-labels-saudi-arabia', destination: '/products/woven-labels', permanent: true },
      { source: '/guides/start-clothing-brand-saudi-arabia', destination: '/starter-kit', permanent: true },
      { source: '/guides/clothing-label-requirements', destination: '/products/satin-labels', permanent: true },
      { source: '/guides', destination: '/products', permanent: true },
      { source: '/guides/:path*', destination: '/products', permanent: true },
      { source: '/home', destination: '/', permanent: true },
      { source: '/index', destination: '/', permanent: true },
      { source: '/index.html', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
