'use client'

import React, { useEffect, useState, lazy, Suspense } from 'react'
import ImageBox from '@/components/shared/ImageBox'

const MuxPlayer = lazy(() => import('@mux/mux-player-react'))

const TwoHybridMedia = ({ data }) => {
  const {
    leftImage,
    rightImage,
    leftVideo,
    rightVideo,
    caption
  } = data || {}

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Helper to parse aspect ratio string and return padding bottom %
  const getPaddingBottom = (aspectRatio = '16:9') => {
    const [width, height] = aspectRatio.split(':').map(Number)
    return (height / width) * 100
  }

  // Render a MuxPlayer wrapped in aspect-ratio container + Suspense
  const renderMuxPlayer = (videoAsset, title) => {
    if (!videoAsset?.playbackId || !isClient) return null

    const paddingBottom = getPaddingBottom(videoAsset.aspect_ratio)

    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: `${paddingBottom}%`,
        }}
      >
        <Suspense fallback={<div style={{ paddingTop: '56.25%', background: '#ddd' }}>Loading video...</div>}>
          <MuxPlayer
            playbackId={videoAsset.playbackId}
            metadata={title ? { video_title: title } : undefined}
            streamType="on-demand"
            accentColor="#ea580c"
            autoPlay="muted"
            loop="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
        </Suspense>
      </div>
    )
  }

  const renderImageBox = (image, alt) => {
    if (!image?.asset) return null

    return (
      <ImageBox
        image={{
          asset: image.asset,
          lqip: image.asset.metadata?.lqip,
        }}
        alt={alt}
      />
    )
  }

  const left = leftVideo?.asset?.playbackId
    ? renderMuxPlayer(leftVideo.asset, 'Left Video')
    : renderImageBox(leftImage, 'Left Image')

  const right = rightVideo?.asset?.playbackId
    ? renderMuxPlayer(rightVideo.asset, 'Right Video')
    : renderImageBox(rightImage, 'Right Image')

  return (
    <div className="divider mt-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4  overflow-hidden hybrid-media">
        <div className=' overflow-hidden'>{left}</div>
        <div className=' overflow-hidden'>{right}</div>
      </div>
      {caption && (
        <div className="mt-2 md:mt-4 text-lg md:text-2xl">{caption}</div>
      )}
    </div>
  )
}

export default TwoHybridMedia
