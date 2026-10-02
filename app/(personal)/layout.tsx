import '@/styles/index.css'

import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import { toPlainText } from 'next-sanity'
import { Suspense } from 'react'

import { Navbar } from '@/components/global/Navbar'
import { defaultDescription, isPreviewDeploy, locale, siteName, siteUrl } from '@/lib/site'
import { urlForOpenGraphImage } from '@/sanity/lib/utils'
import { loadHomePage, loadSettings } from '@/sanity/loader/loadQuery'

const LiveVisualEditing = dynamic(() => import('@/sanity/loader/LiveVisualEditing'))

export async function generateMetadata(): Promise<Metadata> {
  const [{ data: settings }, { data: homePage }] = await Promise.all([
    loadSettings(),
    loadHomePage(),
  ])

  const title = homePage?.title || siteName
  const description = settings?.overview?.text
    ? toPlainText(settings.overview.text)
    : defaultDescription
  const ogImage = urlForOpenGraphImage(settings?.ogImage)

  // Favicon / apple-touch-icon come from app/icon.tsx + app/apple-icon.tsx
  return {
    metadataBase: new URL(siteUrl),
    title: { template: `%s | ${title}`, default: title },
    description,
    applicationName: title,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: title,
      locale,
      title,
      description,
      url: '/',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    robots: isPreviewDeploy
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    formatDetection: { telephone: false, email: false, address: false },
  }
}

export default async function IndexRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex min-h-screen flex-col text-secondary">
        <Suspense>
          <Navbar />
        </Suspense>
        <div className="page-wrap flex-grow min-h-screen">
          <Suspense>{children}</Suspense>
        </div>
      </div>
      {draftMode().isEnabled && <LiveVisualEditing />}
    </>
  )
}
