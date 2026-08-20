import '@/styles/index.css'

import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import { toPlainText } from 'next-sanity'
import { Suspense } from 'react'

import { Footer } from '@/components/global/Footer'
import { Navbar } from '@/components/global/Navbar'
import { urlForOpenGraphImage } from '@/sanity/lib/utils'
import { loadHomePage, loadSettings } from '@/sanity/loader/loadQuery'

const LiveVisualEditing = dynamic(
  () => import('@/sanity/loader/LiveVisualEditing'),
)

export async function generateMetadata(): Promise<Metadata> {
  const [{ data: settings }, { data: homePage }] = await Promise.all([
    loadSettings(),
    loadHomePage(),
  ])

  const ogImage = urlForOpenGraphImage(settings?.ogImage)

  // Favicon / apple-touch-icon come from app/icon.tsx + app/apple-icon.tsx
  // (a flat #F47723 circle) via Next's file-convention metadata — nothing
  // to wire up here.
  return {
    title: homePage?.title
      ? {
          template: `%s | ${homePage.title}`,
          default: homePage.title || 'Personal website',
        }
      : undefined,
    description: settings?.overview?.text
  ? toPlainText(settings.overview.text)
  : undefined,
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  }
}


export default async function IndexRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const [{ data: settings }, { data: homePage }] = await Promise.all([
    loadSettings(),
    loadHomePage(),
  ])


  

  return (
    <>
      <div className="flex min-h-screen flex-col text-secondary">
        <Suspense>
          <Navbar/>
        </Suspense>
        <div className="page-wrap flex-grow  min-h-screen">
          <Suspense>{children}</Suspense>
        </div>

      </div>
      {draftMode().isEnabled && <LiveVisualEditing />}
    </>
  )
}