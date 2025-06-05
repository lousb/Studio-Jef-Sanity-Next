'use client'

import Lenis from '@studio-freight/lenis'
import { useEffect } from 'react'

const LenisProvider = ({ children }) => {
  useEffect(() => {
    // Disable Lenis in Sanity Studio
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/studio')) {
      return
    }

    const lenis = new Lenis({
      duration: 1.2,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    })

    const raf = (time) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}

export default LenisProvider
