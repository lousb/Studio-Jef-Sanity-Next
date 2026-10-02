/**
 * The Sanity Studio (mounted at /admin) gets its own root layout so none of the website's global CSS,
 * loading overlay, smooth scroll, custom cursor or grid overlay run inside it.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
