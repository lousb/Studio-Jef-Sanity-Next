import { notFound } from 'next/navigation'

// The site and the Studio have separate root layouts, so unmatched URLs are
// routed here to render the site's own 404 (app/(site)/not-found.tsx).
export default function CatchAll() {
  notFound()
}
