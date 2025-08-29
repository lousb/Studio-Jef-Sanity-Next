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
      <Navbar />

      {/* Full viewport height */}
      <main className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-10 overflow-hidden">
          <HeroGallery featuredMedia={featuredMedia} />
        </div>

        <h1 className="text-4xl font-bold mt-6">404 – Page Not Found</h1>
        <p className="mt-2 text-gray-600">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <a
          href="/"
          className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Go Home
        </a>
      </main>

      {/* Footer always comes after the 100vh block */}
      <div className='relative z-50 bg-white'>
        <Footer />
      </div>
      
    </div>
  )
}
