/**
 * The Sanity Studio (mounted at /admin) gets its own root layout so none of
 * the website's global CSS, loading overlay, smooth scroll, custom cursor or
 * grid overlay run inside it.
 *
 * bridge.js lets the Studio load inside the Sanity Dashboard (sanity.io),
 * which is where the "Open Studio" button on the project overview goes.
 */
const bridgeScript = 'https://core.sanity-cdn.com/bridge.js'

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <script src={bridgeScript} async type="module" />
        {children}
      </body>
    </html>
  )
}
