'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const Reveal = ({ children, element = 'div', elementClass = '', staggerDelay = 0.01 }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const triggerAnimation = () => {
      const words = el.querySelectorAll('.reveal-word')
      if (words.length) {
        gsap.set(words, { y: '110%' })
        gsap.to(words, {
          y: '0%',
          duration: 1,
          ease: 'power3.out',
          stagger: staggerDelay, // stagger delay in seconds between each word
          delay: 0.5,
        })
      } else {
        // fallback animate container if no words found
        gsap.fromTo(
          el,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
        )
      }
    }

    // Check if the element is already in the viewport
    const rect = el.getBoundingClientRect()
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
    if (isInViewport) {
      triggerAnimation()
      return // Skip setting up the observer if already visible
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

  // Split text into words or characters wrapped in `.reveal-word`
  const splitText = (text) => {
    return text
      .split(' ')
      .map((word, index) => (
        <span key={index} className="reveal-word" style={{ display: 'inline-block' }}>
          <span>{word}&nbsp;</span>
          
        </span>
      ))
  }

  return (
    <Tag
      ref={containerRef}
      className={elementClass}
      style={{ opacity: 1, overflow: 'hidden', margin:0 }}
      
    >
      {typeof children === 'string' ? splitText(children) : children}
    </Tag>
  )
}

export default Reveal