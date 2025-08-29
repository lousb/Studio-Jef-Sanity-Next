'use client'

import React, {
  useRef,
  useEffect,
  useState,
  ElementType,
  ReactNode,
} from 'react'
import { motion, Variants } from 'framer-motion'

export interface RevealDivProps {
  children: ReactNode
  element?: keyof HTMLElementTagNameMap
  elementClass?: string
  onLoad?: boolean
  delay?: number
}

const RevealDiv: React.FC<RevealDivProps> = ({
  children,
  element = 'div',
  elementClass = '',
  onLoad = false,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(onLoad)
  const ref = useRef<HTMLElement | null>(null)
  const revealedOnce = useRef(onLoad)

  useEffect(() => {
    if (onLoad) return
    const node = ref.current
    if (!node) return

    const reveal = () => {
      if (!revealedOnce.current) {
        revealedOnce.current = true
        setIsVisible(true)
      }
    }

    const inViewport = () => {
      const el = ref.current
      if (!el) return false
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      return rect.top < vh && rect.bottom > 0
    }

    const checkNow = () => {
      if (inViewport()) reveal()
    }

    // 1) Initial checks to beat layout/hydration timing issues
    //    - run after paint, then next tick
    requestAnimationFrame(checkNow)
    setTimeout(checkNow, 0)

    // 2) IntersectionObserver (fires immediately in most browsers)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal()
          }
        }
      },
      { root: null, threshold: 0, rootMargin: '0px' }
    )
    observer.observe(node)

    // 3) Fallbacks for layout shifts without scroll (images/fonts)
    window.addEventListener('load', checkNow, { once: true })
    window.addEventListener('resize', checkNow)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', checkNow)
    }
  }, [onLoad])

  const revealAnimation: Variants = {
    initial: {
      opacity: 0,
      y: 60,
      transition: { duration: 1, ease: [.4, 0, .26, 1], delay },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: [.4, 0, .26, 1], delay },
    },
  }

  const MotionComponent = motion[element as keyof typeof motion] as ElementType

  return (
    <MotionComponent
      ref={ref as any}
      className={`div-reveal-element ${elementClass}`}
    >
      <motion.div
        className="reveal-inner"
        variants={revealAnimation}
        initial="initial"
        animate={isVisible ? 'open' : 'initial'}
      >
        {children}
      </motion.div>
    </MotionComponent>
  )
}

export default RevealDiv
