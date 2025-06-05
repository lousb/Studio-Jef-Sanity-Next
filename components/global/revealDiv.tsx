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
  element?: keyof HTMLElementTagNameMap // ✅ Works without relying on React namespace
  elementClass?: string
  onLoad?: boolean
}

const revealAnimation: Variants = {
  initial: {
    opacity:0,
    y: 40,
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
  },
  open: {
    opacity:1,
    y: 0,
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
  },
}

const RevealDiv: React.FC<RevealDivProps> = ({
  children,
  element = 'div',
  elementClass = '',
  onLoad = false,
}) => {
  const [isVisible, setIsVisible] = useState(onLoad)
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (onLoad) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.25 }
    )

    if (ref.current) observer.observe(ref.current)

    return () => {
      if (ref.current) observer.unobserve(ref.current)
    }
  }, [onLoad])

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
