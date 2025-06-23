'use client'

import { useEffect, useState } from 'react'
import React from 'react'
import MuxPlayer from '@mux/mux-player-react'

interface VideoBoxProps {
  playbackId?: string
  caption?: string
  title?: string
}

export default function VideoBox({ playbackId, caption, title }: VideoBoxProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!playbackId) return null

  return (
    <div className="mt-5 md:mt-10">
      <div
        className={`w-full overflow-hidden rounded-[3px] bg-gray-50 aspect-video`}
      >
        {isClient ? (
          <MuxPlayer
            playbackId={playbackId}
            metadata={title ? { video_title: title } : undefined}
            streamType="on-demand"
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