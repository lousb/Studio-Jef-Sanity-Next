import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import { toPlainText } from 'next-sanity'

import { HomePage } from '@/components/pages/home/HomePage'
import { JsonLd } from '@/components/shared/JsonLd'
import { absoluteUrl, defaultDescription, siteName } from '@/lib/site'
import { urlForImage } from '@/sanity/lib/utils'
import { loadHomePage, loadSettings } from '@/sanity/loader/loadQuery'

const HomePagePreview = dynamic(() => import('@/components/pages/home/HomePagePreview'))

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function IndexRoute() {
  const [initial, { data: settings }] = await Promise.all([loadHomePage(), loadSettings()])

  if (draftMode().isEnabled) {
    return <HomePagePreview initial={initial} />
  }

  const name = initial.data?.title || siteName
  const description = settings?.overview?.text
    ? toPlainText(settings.overview.text)
    : defaultDescription
  const logo = urlForImage(initial.data?.customLogo)?.width(512).url()

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': absoluteUrl('/#organization'),
              name,
              url: absoluteUrl('/'),
              description,
              ...(logo ? { logo } : {}),
            },
            {
              '@type': 'WebSite',
              '@id': absoluteUrl('/#website'),
              name,
              url: absoluteUrl('/'),
              publisher: { '@id': absoluteUrl('/#organization') },
              inLanguage: 'en-AU',
            },
          ],
        }}
      />
      <h1 className="sr-only">{name}</h1>
      <HomePage data={initial.data} />
    </>
  )
}
