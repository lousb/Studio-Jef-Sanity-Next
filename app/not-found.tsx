// app/not-found.tsx
import { loadQuery } from '@/sanity/loader/loadQuery'
import { homePageQuery } from '@/sanity/lib/queries'
import type { HomePagePayload } from '@/types'

import { Navbar } from '@/components/global/Navbar'
import { Footer } from '@/components/global/Footer'
import HeroGallery from '@/components/pages/home/HeroGallery'

export default async function NotFound() {
  const { data } = await loadQuery<HomePagePayload>(homePageQuery)
  const { featuredMedia = [] } = data ?? {}

  return (
    <div className="page-404">

      {/* Full viewport height */}
      <main className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        

        <h1 className="text-4xl mt-6">This page doesn’t exist</h1>
        <h1 className="text-4xl">
          Pick a project, stick around.
        </h1>
        <a
          href="/"
          className="mt-4 px-4 py-2 back-to-home"
        >
          Back to home →
        </a>
      </main>
      
    </div>
  )
}
