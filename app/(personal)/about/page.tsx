import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { toPlainText } from 'next-sanity'

import { AboutPage } from '@/components/pages/about/AboutPage'
import { getAboutPage } from '@/sanity/loader/loadQuery'

const AboutPagePreview = dynamic(() => import('@/components/pages/about/AboutPagePreview'))

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getAboutPage()
  const description = data?.overview?.length ? toPlainText(data.overview) : undefined

  return {
    title: data?.title || 'About',
    ...(description ? { description } : {}),
    alternates: { canonical: '/about' },
    openGraph: { url: '/about', ...(description ? { description } : {}) },
  }
}

export default async function AboutRoute() {
  const initial = await getAboutPage()

  if (draftMode().isEnabled) {
    return <AboutPagePreview initial={initial} />
  }

  if (!initial.data) {
    return redirect('/')
  }

  return (
    <>
      <h1 className="sr-only">{initial.data.title || 'About'}</h1>
      <AboutPage data={initial.data} />
    </>
  )
}
