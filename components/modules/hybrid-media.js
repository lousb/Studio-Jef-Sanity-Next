'use client'

import { useEffect, useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'
import Image from 'next/image'

const HybridMedia = ({ data }) => {
  const { media, video, caption } = data || {}
  const muxAsset = video?.asset
  const imageAsset = media?.asset

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

  return (
    <div className="divider mt-5 md:mt-10 hybrid-media">
      {muxAsset?.playbackId ? (
        <div className="w-full overflow-hidden rounded-[3px] bg-gray-50">
          {renderMuxPlayer(muxAsset.playbackId, 'Hybrid Video')}
        </div>
      ) : imageAsset?.url ? (
        <Image
          src={imageAsset.url}
          alt={caption || 'Hybrid Image'}
          width={1600}
          height={900}
          className="w-full rounded-[3px] object-cover"
        />
      ) : null}

      {caption && (
        <div className="mt-2 md:mt-4 text-lg md:text-2xl">{caption}</div>
      )}
    </div>
  )
}

export default HybridMedia
