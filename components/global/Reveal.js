'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const Reveal = ({ children, element = 'div', elementClass = '', staggerDelay = 0.01 }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const triggerAnimation = () => {
      // Select the inner span inside .reveal-word
      const words = el.querySelectorAll('.reveal-word > span')
      if (words.length) {
        // Set initial transform immediately (no animation)
        words.forEach(word => {
          word.style.transform = 'translateY(110%)'
        })

        gsap.to(words, {
          y: '0%',
          duration: 1,
          ease: 'power3.out',
          stagger: staggerDelay,
          delay: 0.5,
        })
      } else {
        // fallback animate container if no words found
        gsap.fromTo(
          el,
          { opacity: 0 },
          { opacity: 1, duration: 1, ease: 'power3.out' }
        )
      }
    }

    // Check if the element is already visible in viewport (for instant animation)
    const rect = el.getBoundingClientRect()
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
    if (isInViewport) {
      triggerAnimation()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          triggerAnimation()
          observer.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [staggerDelay])

  const Tag = element

  // Split text into words wrapped in .reveal-word > span
  const splitText = (text) =>
    text.split(' ').map((word, index) => (
      <span
        key={index}
        className="reveal-word"
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          verticalAlign: 'bottom',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ display: 'inline-block' }}>{word}&nbsp;</span>
      </span>
    ))

  return (
    <Tag
      ref={containerRef}
      className={elementClass}
      style={{ opacity: 1,  margin: 0, willChange: 'transform' }}
    >
      {typeof children === 'string' ? splitText(children) : children}
    </Tag>
  )
}

export default Reveal
