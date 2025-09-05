'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function LoadingOverlay() {
  const [done, setDone] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)
  const [progress, setProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const doneTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const counterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if current URL is /studio or starts with /studio/
    const currentPath = window.location.pathname
    const isStudioRoute = currentPath === '/studio' || currentPath.startsWith('/studio/')
    
    // If it's a studio route, don't show the loading overlay
    if (isStudioRoute) {
      setDone(true)
      setShouldShow(false)
      return
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const initHeader = document.querySelector('#initial-loader') as HTMLElement
    const header = document.querySelector('.header') as HTMLElement

    let showTimeout: NodeJS.Timeout | null = null

    const animateHide = () => {
      if (!containerRef.current) return
      gsap.to(containerRef.current, {
        height: 'calc(24px + 2rem)', // final height
        duration: 1.2,
        ease: 'power2.inOut',
        onComplete: () => {
          setDone(true)
        },
      })
      gsap.to(counterRef.current, {
        y: '-100%', // final height
        delay:0.4,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
          setDone(true)
        },
      })
    }

    const onFullLoad = () => {
      if (showTimeout) clearTimeout(showTimeout)
      if (intervalRef.current) clearInterval(intervalRef.current)

      setProgress(100)

      doneTimeoutRef.current = setTimeout(() => {
        animateHide()

        if (header) {
          gsap.to(header, { height: 'auto', duration: 1.2, ease: 'power2.inOut' })
        }

        if (initHeader) {
          const targetHeight = isMobile
            ? 'calc(24px + 2.4rem)'
            : 'calc(24px + 2.5rem)'
          gsap.to(initHeader, {
            height: targetHeight,
            duration: 1.2,
            ease: 'power2.inOut',
            onComplete: () => gsap.to(initHeader, { opacity: 0, duration: 0 }),
          })
        }
      }, 30)
    }

    showTimeout = setTimeout(() => {
      if (document.readyState !== 'complete') {
        setShouldShow(true)
        if (header) header.style.height = 'auto'

        setProgress(0)
        intervalRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              if (intervalRef.current) clearInterval(intervalRef.current)
              return prev
            }
            return prev + Math.random() * 5
          })
        }, 50)
      }
    }, 150)

    if (document.readyState === 'complete') {
      setDone(true)
      setShouldShow(false)
      if (showTimeout) clearTimeout(showTimeout)
    } else {
      window.addEventListener('load', onFullLoad)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (showTimeout) clearTimeout(showTimeout)
      if (doneTimeoutRef.current) clearTimeout(doneTimeoutRef.current)
      window.removeEventListener('load', onFullLoad)
    }
  }, [])

  if (done || !shouldShow) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-between px-4 py-4 md:px-5 md:py-4 lg:px-5 text-4xl font-sans text-black bg-white"
      style={{ opacity: 1, pointerEvents: 'none', transform: 'translateY(0)' }}
    >
      {/* Left SVG logo */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="24"
        viewBox="0 0 504 220"
        fill="none"
        style={{ position: 'relative', zIndex: 9999 }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M196.161 5.23663C198.069 13.7576 244.107 214.563 244.657 216.763L245.223 219.026L279.325 218.763L313.427 218.5L331.436 153.167C344.984 104.017 349.639 88.4176 350.231 90.1916C350.663 91.4886 358.832 120.888 368.384 155.525L385.751 218.5L419.804 218.763C451.595 219.009 453.892 218.909 454.388 217.263C454.68 216.293 465.765 168.025 479.022 110C492.279 51.9746 503.352 3.71263 503.63 2.74963C504.104 1.10763 502.043 0.999633 470.174 0.999633C443.916 0.999633 436.11 1.28263 435.758 2.24963C435.507 2.93663 430.411 29.0366 424.434 60.2496C418.457 91.4626 413.327 116.995 413.034 116.99C412.74 116.984 405.525 90.8826 397 58.9866L381.5 0.994633L349.564 1.24663L317.628 1.49963L302.1 59.2026C293.56 90.9396 286.332 116.674 286.036 116.389C285.741 116.105 280.531 90.1376 274.458 58.6856L263.415 1.49963L229.311 1.23663L195.207 0.973633L196.161 5.23663ZM41.0003 109.123C18.7253 163.619 0.348302 208.616 0.162302 209.116C-0.037698 209.655 13.7613 209.919 33.9963 209.763L68.1683 209.5L74.8343 193.766L81.5003 178.032L115.611 178.016L149.722 178L154.211 193.75L158.699 209.5L192.81 209.763L226.921 210.026L225.564 206.263C224.818 204.193 208.367 161.55 189.007 111.5C169.647 61.4496 152.918 18.1376 151.832 15.2496L149.856 9.99963L115.678 10.0196L81.5003 10.0396L41.0003 109.123ZM126.918 100.755C131.548 117.115 135.534 131.063 135.775 131.75C136.116 132.72 132.137 133 117.99 133C101.122 133 99.8023 132.87 100.238 131.25C104.719 114.608 117.537 71.0006 117.948 71.0046C118.251 71.0076 122.288 84.3946 126.918 100.755Z"
          fill="black"
        />
      </svg>

      {/* Right counter */}
      
      <div className="loading-counter-init overflow-hidden"><div ref={counterRef}>{Math.min(100, Math.round(progress))}%</div></div>
    </div>
  )
}