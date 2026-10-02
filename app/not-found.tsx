import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="page-404">
      <main className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        <h1 className="text-4xl mt-6">This page doesn’t exist</h1>
        <p className="text-4xl">Pick a project, stick around.</p>
        <Link href="/" className="mt-4 px-4 py-2 back-to-home">
          Back to home →
        </Link>
      </main>
    </div>
  )
}
