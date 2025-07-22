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

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches

    const initHeader = document.querySelector('#initial-loader') as HTMLElement
    const header = document.querySelector('.header') as HTMLElement

    if (initHeader) {
      const anchorTags = initHeader.querySelectorAll(
        ':scope .loading-counter-init',
      )
      anchorTags.forEach((a) => {
        gsap.set(a, { opacity: 0, pointerEvents: 'none' })
      })
    }

    let showTimeout: NodeJS.Timeout | null = null

    const animateHide = () => {
      if (!containerRef.current) return

      gsap.to(containerRef.current, {
        yPercent: -100,
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: () => {
          setDone(true)
        },
      })
    }

    const counterInit = document.querySelector(
      '.loader-counter-init',
    ) as HTMLElement
    if (counterInit) {
      counterInit.style.display = 'none'
    }

    const onFullLoad = () => {
      if (showTimeout) clearTimeout(showTimeout)
      if (intervalRef.current) clearInterval(intervalRef.current)

      setProgress(100)

      doneTimeoutRef.current = setTimeout(() => {
        animateHide()

        if (header) {
          const contentHeight = 'auto'
          header.style.height = '100vh'
          gsap.to(header, {
            height: contentHeight,
            duration: 1.2,
            ease: 'power2.inOut',
          })
        }

        if (initHeader) {
          // ⬇️ Conditional height based on screen size
          const targetHeight = isMobile
            ? 'calc(24px + 2.4rem)' // Same as your media query
            : 'calc(24px + 2.5rem)'

          gsap.to(initHeader, {
            height: targetHeight,
            duration: 1.2,
            ease: 'power2.inOut',
            onComplete: () => {
              gsap.to(initHeader, { opacity: 0, duration: 0 })
            },
          })
        }
      }, 30)
    }

    showTimeout = setTimeout(() => {
      if (document.readyState !== 'complete') {
        setShouldShow(true)
        if (header) {
          header.style.height = 'auto' // instant
        }

        if (initHeader) {
          initHeader.style.display = 'none' // instant
        }
      

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
      className="opacity-[1] fixed inset-0 z-[9998] bg-white text-black flex items-center pr-4 justify-end"
      style={{ transform: 'translateY(0)' }}
    >
      <p className="text-4xl font-mono">
        {Math.min(100, Math.round(progress))}%
      </p>
    </div>
  )
}
