'use client'

import { useEffect, useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'

interface MuxVideoBoxProps {
  playbackId?: string
  caption?: string
  title?: string
  aspectRatio?: string // e.g. "16:9" or "4:3"
}

export default function MuxVideoBox({ playbackId, caption, title, aspectRatio = '16:9' }: MuxVideoBoxProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!playbackId) return null

  // Calculate padding-bottom % from aspect ratio
  const [width, height] = aspectRatio.split(':').map(Number)
  const paddingBottom = (height / width) * 100

  return (
    <div className="mt-5 md:mt-10">
      <div
        className="w-full overflow-hidden rounded-[3px] bg-gray-50"
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: `${paddingBottom}%`,
        }}
      >
        {isClient ? (
          <MuxPlayer
            playbackId={playbackId}
            metadata={title ? { video_title: title } : undefined}
            streamType="on-demand"
            accentColor="#ea580c"
            // autoPlay="any"
            // loop="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
        ) : null}
      </div>
      {caption && (
        <div className="mt-2 md:mt-4 text-lg md:text-2xl">{caption}</div>
      )}
    </div>
  )
}
