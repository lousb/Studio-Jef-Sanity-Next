import dynamic from 'next/dynamic'

const SingleImage = dynamic(() => import('./single-image'))
const TwoImages = dynamic(() => import('./two-images'))
const TextBlock = dynamic(() => import('./text-box'))
const SingleVideo = dynamic(() => import('./single-video'))
const SingleVideoMux = dynamic(() => import('./single-video-mux'))
const TwoVideos = dynamic(() => import('./two-videos'))
const HybridMedia = dynamic(() => import('./hybrid-media'))
const TwoHybridMedia = dynamic(() => import('./two-hybrid-media'))

export const Module = ({
  content,
}) => {
  const type = content._type

  switch (type) {
    case 'singleImage':
      return <SingleImage data={content} />
    case 'twoImages':
      return <TwoImages data={content} />
    case 'textBlock':
        return <TextBlock data={content} />
    case 'singleVideo':
      return <SingleVideo data={content} />
    case 'video': // Handle "video" type for SingleVideoMux
    return <SingleVideoMux data={content} />
    case 'twoVideos':
      return <TwoVideos data={content} />
    case 'hybridMedia':
      return <HybridMedia data={content} />
    case 'twoHybridMedia':
      return <TwoHybridMedia data={content} />
    default:
      return null
  }
}