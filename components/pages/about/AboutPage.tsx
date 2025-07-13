'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import { Link } from 'next-view-transitions'

import AboutImageBox from '@/components/shared/AboutImageBox'
import Reveal from '@/components/global/Reveal'
import MuxPlayer from '@mux/mux-player-react'
import type { AboutPayload } from '@/types'

export interface AboutPageProps {
  data: AboutPayload | null
  encodeDataAttribute?: EncodeDataAttributeCallback
}

// Helper to extract plain text from PortableText blocks
function extractPlainTextFromPortableText(overview: any[]) {
  if (!overview || overview.length === 0) return ''

  return overview
    .map(block => {
      if (block._type === 'block' && Array.isArray(block.children)) {
        return block.children
          .map((child: any) => (typeof child.text === 'string' ? child.text : ''))
          .join(' ')
      }
      return ''
    })
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function AboutPage({ data }: AboutPageProps) {
  const { overview, aboutLinks, aboutMedia } = data ?? {}

  const imageAsset = aboutMedia?.media?.asset
  const videoAsset = aboutMedia?.video?.asset
  const playbackId = videoAsset?.playbackId

  const [overlayVisible, setOverlayVisible] = useState(true)
  const [headerInvert, setHeaderInvert] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [timeoutDone, setTimeoutDone] = useState(false)

  const overlayRef = useRef<HTMLDivElement | null>(null)
  const backgroundRef = useRef<HTMLDivElement | null>(null)

  // Memoize extracted plain text
  const plainText = useMemo(() => extractPlainTextFromPortableText(overview ?? []), [overview])

  useEffect(() => {
    // Start timer for overlay delay
    const timeout = setTimeout(() => setTimeoutDone(true), 1000)

    // Video loaded event handler
    const handleLoaded = () => setVideoLoaded(true)

    const videoEl = document.querySelector('mux-player')
    if (videoEl) {
      videoEl.addEventListener('loadeddata', handleLoaded)
    } else {
      // No video: simulate load instantly
      setVideoLoaded(true)
    }

    return () => {
      clearTimeout(timeout)
      if (videoEl) videoEl.removeEventListener('loadeddata', handleLoaded)
    }
  }, [playbackId])

  useEffect(() => {
    if (videoLoaded && timeoutDone && overlayRef.current) {
      gsap.to(overlayRef.current, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1.5,
        ease: 'power3.inOut',
        onStart: () => setHeaderInvert(true),
        onComplete: () => setOverlayVisible(false),
      })
      gsap.fromTo(
        backgroundRef.current,
        { scale: '1.25', y: '10vh' },
        { scale: '1', y: '0', duration: 1.5, ease: 'power3.inOut' }
      )
    }
  }, [videoLoaded, timeoutDone])

  return (
    <div
      className={`about-page h-full mt-4 gap-5 pl-[19.5vw] overflow-hidden ${
        headerInvert ? 'header-invert' : ''
      }`}
    >
      {/* Opaque Overlay */}
      {overlayVisible && (
        <div
          ref={overlayRef}
          className="about-page-overlay absolute inset-0 z-50 bg-white pointer-events-none"
          style={{ clipPath: 'inset(0 0 0 0)' }}
        >
          {plainText && (
            <div className="mt-2 text-12xl md:text-13xl pl-[19.5vw]">
              <Reveal element="div" elementClass="text-black mt-4 text-7xl md:text-7xl">
                {plainText}
              </Reveal>
            </div>
          )}
        </div>
      )}

      {/* Instagram Link with Reveal */}
      <div className="about-link">
        <Reveal element="div" elementClass="text-white">
          <a
            href="https://www.instagram.com/aw____studio/"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-0 text-white"
          >
            → Instagram
          </a>
        </Reveal>
      </div>

      {/* Non-overlay overview Reveal */}
      <div className="w-full pb-[1.25rem]">
        {plainText && (
          <div className="mt-2 text-12xl md:text-13xl">
            <Reveal element="div" elementClass="text-white mt-4 text-7xl md:text-7xl">
              {plainText}
            </Reveal>
          </div>
        )}
      </div>

      {/* Uncomment if you want to render aboutLinks */}
      {/* 
      <div className="mt-10 flex flex-col">
        {aboutLinks?.map((aboutLink, key) => (
          <div key={key} className="flex flex-wrap">
            <Link
              target="_blank"
              className="flex flex-wrap text-xl text-secondary underline md:text-2xl"
              href={aboutLink.url!}
            >
              {aboutLink.title}
            </Link>
          </div>
        ))}
      </div> 
      */}

      {/* Background media (image/video) */}
      <div className="about-page-bg h-[100vh] relative" ref={backgroundRef}>
        <div className="w-full h-[100vh]">
          {imageAsset && (
            <AboutImageBox
              image={aboutMedia.media}
              alt="About image"
              classesWrapper="relative"
            />
          )}

          {playbackId && (
            <div className="relative w-full h-full hybrid-media">
              <MuxPlayer
                streamType="on-demand"
                playbackId={playbackId}
                autoPlay="muted"
                loop={true}
                playsInline
                className="w-full h-full object-cover"
                style={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AboutPage
