const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL || // Netlify (primary site URL)
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'http://localhost:3000'

/** @type {import('next').NextConfig} */
const config = {
  // Inlined at build so server functions see the same values as the build did
  env: {
    SITE_URL: siteUrl,
    DEPLOY_CONTEXT: process.env.CONTEXT || process.env.VERCEL_ENV || 'development',
  },
  images: {
    remotePatterns: [{ hostname: 'cdn.sanity.io' }],
  },
  // Production builds fail on type or lint errors — nothing broken ships.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  logging: {
    fetches: { fullUrl: true },
  },
  experimental: {
    taint: true,
  },
  async headers() {
    return [
      {
        source: '/studio/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default config
