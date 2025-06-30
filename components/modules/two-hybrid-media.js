'use client'

import { useEffect, useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'
import Image from 'next/image'

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
        loop='true'
      />
    )
  }

  const left = leftVideo?.asset?.playbackId
    ? renderMuxPlayer(leftVideo.asset.playbackId, 'Left Video')
    : leftImage?.asset?.url
      ? <Image
          src={leftImage.asset.url}
          alt="Left Image"
          width={800}
          height={900}
          className="w-full rounded-[3px] object-cover"
        />
      : null

  const right = rightVideo?.asset?.playbackId
    ? renderMuxPlayer(rightVideo.asset.playbackId, 'Right Video')
    : rightImage?.asset?.url
      ? <Image
          src={rightImage.asset.url}
          alt="Right Image"
          width={800}
          height={900}
          className="w-full rounded-[3px] object-cover"
        />
      : null

  return (
    <div className="divider mt-5 md:mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-[3px] overflow-hidden hybrid-media">
        <div>{left}</div>
        <div>{right}</div>
      </div>
      {caption && (
        <div className="mt-2 md:mt-4 text-lg md:text-2xl">{caption}</div>
      )}
    </div>
  )
}

export default TwoHybridMedia
