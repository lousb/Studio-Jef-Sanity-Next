import './globals.css'
import { loadSettings } from '@/sanity/loader/loadQuery'
import LenisProvider from '@/components/global/LenisProvider'
import { ViewTransitions } from 'next-view-transitions'
import { Suspense } from 'react'
import LoadingOverlay from '@/components/shared/LoadingOverlay'
import { urlForImage } from '@/sanity/lib/utils'
import GridOverlay from '@/components/global/GridOverlay'
import NavigationCursor from '@/components/global/NavigationCursor'
import { InfiniteLoop } from '@/components/global/InfiniteLoop'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [{ data: settings }] = await Promise.all([loadSettings()])

  
  // Get the loading screen image URL from settings
  const loadingImageUrl = settings?.ogImage 
    ? urlForImage(settings.ogImage)?.width(1080).quality(75).url() 
    : null

    

  return (
    <ViewTransitions>
      <html
        lang="en"
        className="bg-primary"
      >
        <head>
          {/* Critical CSS to prioritize initial loader rendering */}
          <style dangerouslySetInnerHTML={{
            __html: `
              #initial-loader {
                position: fixed !important;
                inset: 0 !important;
                color: black !important;
                z-index: -1 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding: 1.25rem !important;
                font-size: 2.25rem !important;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                opacity: 0 !important;
                transition: opacity 300ms ease !important;
                pointer-events: none !important;
                will-change: opacity !important;
              }
            `
          }} />
        </head>
        <body>
          <div
            id="initial-loader"
            style={{
              position: 'fixed',
              inset: 0,
              color: 'black',
              zIndex: -1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem',
              fontSize: '2.25rem',
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              opacity: 0,
              transition: 'opacity 300ms ease',
              pointerEvents: 'none',
            }}
          >
            <div className="loading-counter-init">0%</div>
          </div>
          
          <script
            dangerouslySetInnerHTML={{
              __html: `
                setTimeout(() => {
                  const el = document.getElementById('initial-loader');
                  if (el) el.style.opacity = '1';
                }, 1000);
              `,
            }}
          />

          {/* 🟢 React-based loader takes over - now with dynamic image */}
          <LoadingOverlay imageUrl={loadingImageUrl} />
          <GridOverlay />
          <NavigationCursor />
          <Suspense fallback={null}>

            <LenisProvider>
           
              <div className="overlay"></div>
              <div className="overlay-shadow"></div>
              {children}
        
            </LenisProvider>
          </Suspense>
            <script
  dangerouslySetInnerHTML={{
    __html: `
      (function () {
        var resizeTimeout;
        window.addEventListener('resize', function () {
          document.documentElement.classList.add('resizing');
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(function () {
            document.documentElement.classList.remove('resizing');
          }, 150);
        });
      })();
    `,
  }}
/>
        </body>
      </html>
    </ViewTransitions>
  )
}