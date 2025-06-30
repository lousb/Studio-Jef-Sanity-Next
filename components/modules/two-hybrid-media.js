'use client'

import { useEffect, useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'
import ImageBox from '@/components/shared/ImageBox'

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

  const renderMuxPlayer = (playbackId, title) => {
    if (!playbackId || !isClient) return null

    return (
      <MuxPlayer
        playbackId={playbackId}
        metadata={title ? { video_title: title } : undefined}
        streamType="on-demand"
        accentColor="#ea580c"
        autoPlay="muted"
        loop="true"
      />
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
        width={1600}
        height={900}
      />
    )
  }

  const left = leftVideo?.asset?.playbackId
    ? renderMuxPlayer(leftVideo.asset.playbackId, 'Left Video')
    : renderImageBox(leftImage, 'Left Image')

  const right = rightVideo?.asset?.playbackId
    ? renderMuxPlayer(rightVideo.asset.playbackId, 'Right Video')
    : renderImageBox(rightImage, 'Right Image')

  return (
    <div className="divider mt-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-[3px] overflow-hidden hybrid-media">
        <div className='rounded-[3px] overflow-hidden'>{left}</div>
        <div className='rounded-[3px] overflow-hidden' >{right}</div>
      </div>
      {caption && (
        <div className="mt-2 md:mt-4 text-lg md:text-2xl">{caption}</div>
      )}
    </div>
  )
}

export default TwoHybridMedia
