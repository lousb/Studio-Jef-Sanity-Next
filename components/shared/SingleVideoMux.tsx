'use client'

import { useEffect, useState } from 'react'
import React from 'react'
import MuxPlayer from '@mux/mux-player-react'

interface MuxVideoBoxProps {
  playbackId?: string
  caption?: string
  title?: string
}

export default function MuxVideoBox({ playbackId, caption, title }: MuxVideoBoxProps) {

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!playbackId) return null

  return (
    <div className="mt-5 md:mt-10">
      <div
        className={`w-full overflow-hidden rounded-[3px] bg-gray-50`}
      >
        {isClient ? (
          <MuxPlayer
            playbackId={playbackId}
            metadata={title ? { video_title: title } : undefined}
            streamType="on-demand"
            accentColor="#ea580c"
            // autoPlay="any"
            // loop="true"
          />
        ) : (
          ''
        )}
      </div>
      {caption && (
        <div className="mt-2 md:mt-4 text-lg md:text-2xl">{caption}</div>
      )}
    </div>
  )
}