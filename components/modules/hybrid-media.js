'use client'

import { useEffect, useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'
import ImageBox from '@/components/shared/ImageBox'

const HybridMedia = ({ data }) => {
  const { media, video, caption } = data || {}
  const muxAsset = video?.asset

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

  return (
    <div className="divider mt-3 hybrid-media">
      {muxAsset?.playbackId ? (
        <div className="w-full overflow-hidden rounded-[3px]">
          {renderMuxPlayer(muxAsset.playbackId, 'Hybrid Video')}
        </div>
      ) : media?.asset ? (
        <ImageBox
          image={{
            asset: media.asset,
            lqip: media.asset.metadata?.lqip,
          }}
          alt={caption || 'Hybrid Image'}
          caption={caption}

        />
      ) : null}
    </div>
  )
}

export default HybridMedia
