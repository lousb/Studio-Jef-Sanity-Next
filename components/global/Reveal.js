'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const Reveal = ({ children, element = 'div', elementClass = '', staggerDelay = 0.01 }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const words = el.querySelectorAll('.reveal-word')
          if (words.length) {
            gsap.set(words, { y: '110%' })
            gsap.to(words, {
              y: '0%',
              duration: 1,
              ease: 'power3.out',
              stagger: staggerDelay, // stagger delay in seconds between each word
              delay:0.2,
            })
          } else {
            // fallback animate container if no words found
            gsap.fromTo(
              el,
              { y: 50, opacity: 0 },
              { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
            )
          }
          observer.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [staggerDelay])

  const Tag = element

  return (
    <Tag
      ref={containerRef}
      className={elementClass}
      style={{ opacity: 1, overflow: 'hidden' }}
    >
        <span>
        {children}
        </span>
    </Tag>
  )
}

export default Reveal
