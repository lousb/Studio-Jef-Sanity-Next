'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface LoadingOverlayProps {
  imageUrl?: string | null
}

// Flip this to true to force the loader to run on every refresh, regardless of route or cache state.
const TEST_MODE = false

export default function LoadingOverlay({ imageUrl }: LoadingOverlayProps) {
  const [done, setDone] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)
  const [progress, setProgress] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const doneTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const counterRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const imageMaskRef = useRef<HTMLDivElement>(null)
  const hasFadedRef = useRef(false)

  // Smooth mouse-follow for the counter
  const quickX = useRef<gsap.QuickToFunc | null>(null)
  const quickY = useRef<gsap.QuickToFunc | null>(null)

  useEffect(() => {
    if (!shouldShow || !counterRef.current) return

    // Start centered on screen until the mouse actually moves
    gsap.set(counterRef.current, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      opacity: 1,
    })

    quickX.current = gsap.quickTo(counterRef.current, 'x', {
      duration: 1,
      ease: 'power3.out',
    })
    quickY.current = gsap.quickTo(counterRef.current, 'y', {
      duration: 1,
      ease: 'power3.out',
    })

    const handleMouseMove = (e: MouseEvent) => {
      quickX.current?.(e.clientX)
      quickY.current?.(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [shouldShow])

  // Fade the counter out once progress hits 100
  

  // Vertical mask animation in - only after image is loaded
  useEffect(() => {
    if (shouldShow && imageLoaded && imageMaskRef.current && imageRef.current) {
      gsap.set(imageRef.current, {
        scale: 1.15
      })

      gsap.to(imageRef.current, {
        scale: 1,
        duration: 1.4,
        ease: 'power3.out'
      })
    }
  }, [shouldShow, imageLoaded])

  useEffect(() => {
    const currentPath = window.location.pathname
    const isStudioRoute =
      currentPath === '/studio' || currentPath.startsWith('/studio/')

    if (isStudioRoute) {
      setShouldShow(true)
      setDone(false)
      setProgress(0)

      let currentProgress = 0
      intervalRef.current = setInterval(() => {
        currentProgress += Math.random() * 2 + 1
        setProgress(currentProgress)
        if (currentProgress >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setProgress(100)
          setTimeout(() => {
            setDone(true)
          }, 800)
        }
      }, 80)

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const initHeader = document.querySelector('#initial-loader') as HTMLElement
    const header = document.querySelector('.header') as HTMLElement

    let showTimeout: NodeJS.Timeout | null = null

    const animateHide = () => {
      if (!containerRef.current) return

      if (imageMaskRef.current) {
        gsap.to(imageMaskRef.current, {
          clipPath: 'inset(0% 0% 100% 0% round 20px)',
          y: -200,
          duration: 2,
          ease: 'power3.inOut'
        })
      }

      gsap.to(counterRef.current, {
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
      })

      gsap.fromTo('.fixed-logo', {
        opacity:0
      },{
        opacity:1,
        duration: 1.2,
        ease: 'power2.in',
      })

      gsap.to(containerRef.current, {
        height: '0',
        duration: 1.2,
        delay: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
          setDone(true)
        },
      })

      if (counterRef.current) {
        gsap.to(counterRef.current, {
          delay: 1,
          duration: 0.8,
          ease: 'power2.inOut',
        })
      }
    }

    const onFullLoad = () => {
      if (showTimeout) clearTimeout(showTimeout)
      if (intervalRef.current) clearInterval(intervalRef.current)
      setProgress(100)

      doneTimeoutRef.current = setTimeout(() => {
        animateHide()

       

        if (header) {
          gsap.to(header, {
            height: 'auto',
            duration: 1.2,
            ease: 'power2.inOut',
          })
        }

        if (initHeader) {
          const targetHeight = isMobile
            ? 'calc(24px + 2.4rem)'
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
      }, 800)
    }

    showTimeout = setTimeout(() => {
      if (TEST_MODE || document.readyState !== 'complete') {
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

    if (!TEST_MODE && document.readyState === 'complete') {
      setDone(true)
      setShouldShow(false)
      if (showTimeout) clearTimeout(showTimeout)
    } else if (TEST_MODE) {
      doneTimeoutRef.current = setTimeout(() => {
        animateHide()
      }, 2000)
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
      className="fixed inset-0 z-[9999] text-black bg-white"
      style={{ opacity: 1, transform: 'translateY(0)' }}
    >
      <div
        ref={counterRef}
        className="loading-counter-init overflow-hidden pointer-events-none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
        {Math.min(100, Math.round(progress))}%
      </div>
    </div>
  )
}