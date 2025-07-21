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
  delay?: number // Add delay prop
}

const RevealDiv: React.FC<RevealDivProps> = ({
  children,
  element = 'div',
  elementClass = '',
  onLoad = false,
  delay = 0, // Default delay to 0.2
}) => {
  const [isVisible, setIsVisible] = useState(onLoad)
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (onLoad) return

    const checkVisibility = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()

      // If the element's bottom is above the viewport's top, mark it as visible
      const isPastViewport = rect.bottom <= 0
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0

      if (isPastViewport || isInViewport) {
        setIsVisible(true)
      }
    }

    // Check visibility on initial render
    checkVisibility()

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)

    return () => {
      if (ref.current) observer.unobserve(ref.current)
    }
  }, [onLoad])

  // Dynamically set the delay in the animation
  const revealAnimation: Variants = {
    initial: {
      opacity: 0,
      y: 60,
      transition: { duration: 1, ease: [.4,0,.26,1], delay },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: [.4,0,.26,1], delay },
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