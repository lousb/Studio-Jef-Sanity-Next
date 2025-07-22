import React, { lazy, Suspense } from 'react'

const MuxVideoBox = lazy(() => import('@/components/shared/SingleVideoMux'))

const Video = ({ data = {} }) => {
  const { asset, caption, _type } = data
  const playbackId = asset?.playbackId || null
  const url = asset?.url || null
  const aspectRatio = asset?.aspect_ratio || '16:9'


  if (!playbackId) {
    console.warn('No playbackId found for video:', data)
    return null
  }

  return (
    <div className="divider">
      <Suspense fallback={<div style={{ paddingTop: '56.25%', background: '#eee' }}>Loading video...</div>}>
        <MuxVideoBox
          playbackId={playbackId}
          caption={caption}
          title={_type}
          aspectRatio={aspectRatio}
        />
      </Suspense>
    </div>
  )
}

export default Video
