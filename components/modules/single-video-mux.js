import SingleVideo from '@/components/shared/SingleVideo'

const Video = ({ data = {} }) => {
  const { playbackId, caption, title } = data

  if (!playbackId) return null
  return (
    
    <div className="divider">
          <SingleVideo
            playbackId={playbackId}
            caption={caption}
            title={title}
          />
    </div>
  )
}

export default Video