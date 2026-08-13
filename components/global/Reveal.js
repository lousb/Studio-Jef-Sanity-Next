'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const Reveal = ({ children, element = 'div', elementClass = '', staggerDelay = 0.05 }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const triggerAnimation = () => {
      const words = el.querySelectorAll('.reveal-word')
      if (words.length) {
        gsap.set(words, { opacity: 0 })

        gsap.to(words, {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: staggerDelay,
          delay: 0.5,
        })
      } else {
        gsap.fromTo(
          el,
          { opacity: 0 },
          { opacity: 1, duration: 1, ease: 'power3.out' }
        )
      }
    }

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

  const splitText = (text) =>
    text.split(' ').map((word, index) => (
      <span
        key={index}
        className="reveal-word"
        style={{
          display: 'inline-block',
        }}
      >
        {word}&nbsp;
      </span>
    ))

  return (
    <Tag
      ref={containerRef}
      className={elementClass}
      style={{ opacity: 1, margin: 0 }}
    >
      {typeof children === 'string' ? splitText(children) : children}
    </Tag>
  )
}

export default Reveal