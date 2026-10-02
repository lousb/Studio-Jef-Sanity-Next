/**
 * Site-wide SEO constants.
 *
 * SITE_URL / DEPLOY_CONTEXT are inlined at build time by next.config.mjs, from
 * (in order): NEXT_PUBLIC_SITE_URL, Netlify's URL, Vercel's production URL.
 * Set NEXT_PUBLIC_SITE_URL=https://yourdomain in your host's env vars once the
 * real domain is connected so canonicals, OG tags and the sitemap use it.
 */
export const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export const siteName = 'Studio Jef'
export const defaultDescription = 'Studio Jef, landscape architects.'
export const locale = 'en_AU'

/** Deploy previews / branch deploys must never be indexed. Production and unknown hosts are. */
export const isPreviewDeploy = ['deploy-preview', 'branch-deploy', 'preview'].includes(
  process.env.DEPLOY_CONTEXT || '',
)

export const absoluteUrl = (path = '/') => `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
