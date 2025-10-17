import './globals.css'
import { loadSettings } from '@/sanity/loader/loadQuery'
import LenisProvider from '@/components/global/LenisProvider'
import { ViewTransitions } from 'next-view-transitions'
import { Suspense } from 'react'
import LoadingOverlay from '@/components/shared/LoadingOverlay'
import { urlForImage } from '@/sanity/lib/utils'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [{ data: settings }] = await Promise.all([loadSettings()])

  const rgbaBgColor = `${settings?.bgColor?.r ?? 255}, ${settings?.bgColor?.g ?? 255}, ${settings?.bgColor?.b ?? 255}`
  const rgbaTextColor = `${settings?.textColor?.r ?? 0}, ${settings?.textColor?.g ?? 0}, ${settings?.textColor?.b ?? 0}`

  // Get the loading screen image URL from settings
  const loadingImageUrl = settings?.ogImage 
    ? urlForImage(settings.ogImage)?.width(1080).quality(75).url() 
    : null

  return (
    <ViewTransitions>
      <html
        lang="en"
        style={{
          ['--color-primary' as any]: rgbaBgColor,
          ['--color-secondary' as any]: rgbaTextColor,
        }}
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
          {/* 🟡 Initial HTML Loader with fade-in - now first in DOM */}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="30"
              viewBox="0 0 504 220"
              fill="none"
              style={{ zIndex: 9999, position: 'relative' }}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M196.161 5.23663C198.069 13.7576 244.107 214.563 244.657 216.763L245.223 219.026L279.325 218.763L313.427 218.5L331.436 153.167C344.984 104.017 349.639 88.4176 350.231 90.1916C350.663 91.4886 358.832 120.888 368.384 155.525L385.751 218.5L419.804 218.763C451.595 219.009 453.892 218.909 454.388 217.263C454.68 216.293 465.765 168.025 479.022 110C492.279 51.9746 503.352 3.71263 503.63 2.74963C504.104 1.10763 502.043 0.999633 470.174 0.999633C443.916 0.999633 436.11 1.28263 435.758 2.24963C435.507 2.93663 430.411 29.0366 424.434 60.2496C418.457 91.4626 413.327 116.995 413.034 116.99C412.74 116.984 405.525 90.8826 397 58.9866L381.5 0.994633L349.564 1.24663L317.628 1.49963L302.1 59.2026C293.56 90.9396 286.332 116.674 286.036 116.389C285.741 116.105 280.531 90.1376 274.458 58.6856L263.415 1.49963L229.311 1.23663L195.207 0.973633L196.161 5.23663ZM41.0003 109.123C18.7253 163.619 0.348302 208.616 0.162302 209.116C-0.037698 209.655 13.7613 209.919 33.9963 209.763L68.1683 209.5L74.8343 193.766L81.5003 178.032L115.611 178.016L149.722 178L154.211 193.75L158.699 209.5L192.81 209.763L226.921 210.026L225.564 206.263C224.818 204.193 208.367 161.55 189.007 111.5C169.647 61.4496 152.918 18.1376 151.832 15.2496L149.856 9.99963L115.678 10.0196L81.5003 10.0396L41.0003 109.123ZM126.918 100.755C131.548 117.115 135.534 131.063 135.775 131.75C136.116 132.72 132.137 133 117.99 133C101.122 133 99.8023 132.87 100.238 131.25C104.719 114.608 117.537 71.0006 117.948 71.0046C118.251 71.0076 122.288 84.3946 126.918 100.755Z"
                fill="black"
              />
            </svg>
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
          <Suspense fallback={null}>
            <LenisProvider>
              <div className="overlay"></div>
              <div className="overlay-shadow"></div>
              {children}
            </LenisProvider>
          </Suspense>
        </body>
      </html>
    </ViewTransitions>
  )
}