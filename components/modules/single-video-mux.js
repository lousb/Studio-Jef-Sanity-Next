import SingleVideo from '@/components/shared/SingleVideoMux'

const Video = ({ data = {} }) => {
  const { asset, caption, _type } = data
  const playbackId = asset?.playbackId || null
  const url = asset?.url || null

  console.log('single video data:', { playbackId, caption, url, _type })

  if (!playbackId) {
    console.warn('No playbackId found for video:', data)
    return null
  }

  return (
    <div className="divider">
      <SingleVideo
        playbackId={playbackId}
        caption={caption}
        url={url}
        title={_type}
      />
    </div>
  )
}

export default Video