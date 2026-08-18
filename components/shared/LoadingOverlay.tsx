'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface LoadingOverlayProps {
  imageUrl?: string | null
}

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

  // Vertical mask animation in - only after image is loaded
  useEffect(() => {
    if (shouldShow && imageLoaded && imageMaskRef.current && imageRef.current) {
      // Initial state - image scaled up
      gsap.set(imageRef.current, {
        scale: 1.15
      })
      
      // Initial state - mask cropped to compensate (7.5% on all sides for 1.15 scale)
      // gsap.set(imageMaskRef.current, { 
      //   clipPath: 'inset(100% 10% 10% 10% round 20px)' 
      // })
      
      // Animate in - reveal from top to bottom while removing side crop
      // gsap.to(imageMaskRef.current, {
      //   clipPath: 'inset(0% 0% 0% 0% round 20px)',
      //   duration: 1.4,
      //   ease: 'power3.out'
      // })
      
      // Animate image scale down
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
      
      // First, mask out the image vertically
      if (imageMaskRef.current) {
        gsap.to(imageMaskRef.current, {
          clipPath: 'inset(0% 0% 100% 0% round 20px)',
          y:-200,
          duration: 2,
          ease: 'power3.inOut'
        })
      }
      
      // Then animate the container height after a delay
      gsap.to(containerRef.current, {
        height: 'calc(24px + 2rem)',
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

      // ✅ Hold 0.8s before exit animation
      doneTimeoutRef.current = setTimeout(() => {
        // Run the exit animation
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
      className="fixed inset-0 z-[9999] flex items-center justify-center text-black bg-white"
      style={{ opacity: 1, transform: 'translateY(0)' }}
    >
      
      <div
        style={{
          zIndex: 1,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          
        }}
      >
        
        <div className="loading-counter-init overflow-hidden">
          <div ref={counterRef}>{Math.min(100, Math.round(progress))}%</div>
        </div>
      </div>
    </div>
  )
}