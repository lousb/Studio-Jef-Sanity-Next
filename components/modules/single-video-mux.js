import SingleVideo from '@/components/shared/SingleVideo'

const Video = ({ data = {} }) => {
  const { playbackId, caption, title } = data

  console.log(data)

//   if (!playbackId) return null
  return (
    
    <div className="divider">
        TETTSTSTSTTSS
          <SingleVideo
            playbackId={playbackId}
            caption={caption}
            title={title}
          />
    </div>
  )
}

export default Video