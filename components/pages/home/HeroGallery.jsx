'use client'

import React, { useEffect, useRef, useState, lazy, Suspense } from 'react'
import ImageBox from '@/components/shared/ImageBox'
const MuxPlayer = lazy(() => import('@mux/mux-player-react'))

function isVideo(media) {
  return media?.asset?.playbackId
}

function extractGalleryItems(featuredMedia) {
  const items = []

  featuredMedia?.forEach((item) => {
    const type = item?._type
    if (type === 'hybridMedia' && item.featured) {
      if (item.video?.asset?.playbackId) {
        items.push({ type: 'video', mux: item.video.asset })
      } else if (item.media?.asset?.url) {
        items.push({ type: 'image', asset: item.media.asset })
      }
    }
    if (type === 'twoHybridMedia') {
      if (item.leftFeatured) {
        if (item.leftVideo?.asset?.playbackId) {
          items.push({ type: 'video', mux: item.leftVideo.asset })
        } else if (item.leftImage?.asset?.url) {
          items.push({ type: 'image', asset: item.leftImage.asset })
        }
      }
      if (item.rightFeatured) {
        if (item.rightVideo?.asset?.playbackId) {
          items.push({ type: 'video', mux: item.rightVideo.asset })
        } else if (item.rightImage?.asset?.url) {
          items.push({ type: 'image', asset: item.rightImage.asset })
        }
      }
    }
  })

  return items
}

const HeroGallery = ({ featuredMedia }) => {
  const containerRef = useRef(null)
  const [items, setItems] = useState([])

  useEffect(() => {
    setItems(extractGalleryItems(featuredMedia))
  }, [featuredMedia])

  return (
    <div
      ref={containerRef}
      className="hero-gallery-wrapper fixed top-0 left-0 w-screen h-screen overflow-hidden"
    >
      <div className="absolute w-full h-full pointer-events-none">
        {items.map((item, idx) => {
          const key = `media-${idx}`
          if (item.type === 'video') {
            return (
              <div key={key} className="absolute w-[320px] h-[180px]">
                <Suspense fallback={null}>
                  <MuxPlayer
                    playbackId={item.mux.playbackId}
                    streamType="on-demand"
                    autoPlay="muted"
                    loop
                    style={{ width: '100%', height: '100%' }}
                  />
                </Suspense>
              </div>
            )
          } else if (item.type === 'image') {
            return (
              <div key={key} className="absolute w-[320px] h-auto">
                <ImageBox
                  image={{ asset: item.asset, lqip: item.asset?.metadata?.lqip }}
                  alt="Featured Image"
                />
              </div>
            )
          } else {
            return null
          }
        })}
      </div>
    </div>
  )
}

export default HeroGallery
